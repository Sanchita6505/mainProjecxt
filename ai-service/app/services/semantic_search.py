from functools import lru_cache
from typing import Any, Dict, List, Optional

from app.schemas.location import UserLocation
from app.schemas.semantic_search import SemanticSearchFilters
from app.services.embeddings import EmbeddingService, get_embedding_service
from app.utils.geo import haversine_distance_km
from app.vectorstore import ChromaCollectionManager, VectorSearchResult, get_collection_manager


class SemanticSearchService:
    def __init__(
        self,
        collection_manager: ChromaCollectionManager,
        embedding_service: EmbeddingService,
    ) -> None:
        self._collection_manager = collection_manager
        self._embedding_service = embedding_service

    def search(
        self,
        *,
        query: str,
        top_k: int,
        collection_name: Optional[str],
        filters: Optional[SemanticSearchFilters],
        location: Optional[UserLocation],
    ) -> List[VectorSearchResult]:
        query_embedding = self._embedding_service.generate_embedding(query)
        where = self._build_where_filter(filters)
        results = self._collection_manager.search(
            query_embedding=query_embedding,
            n_results=top_k,
            where=where,
            collection_name=collection_name,
        )
        return self._rank_with_location(results=results, location=location)

    @staticmethod
    def _build_where_filter(filters: Optional[SemanticSearchFilters]) -> Optional[Dict[str, Any]]:
        if filters is None:
            return None

        values = filters.model_dump(exclude_none=True)
        if not values:
            return None
        if len(values) == 1:
            return values
        return {"$and": [{key: value} for key, value in values.items()]}

    @staticmethod
    def _rank_with_location(
        *,
        results: List[VectorSearchResult],
        location: Optional[UserLocation],
    ) -> List[VectorSearchResult]:
        if not results:
            return results

        for result in results:
            similarity = SemanticSearchService._distance_to_similarity(result.distance)
            metadata = result.metadata or {}
            metadata["semantic_similarity"] = similarity

            if location is not None:
                distance_km = SemanticSearchService._distance_from_metadata(location, metadata)
                if distance_km is not None:
                    metadata["distance_km"] = distance_km
                    metadata["location_score"] = 1.0 / (1.0 + distance_km)

            result.metadata = metadata

        if location is None:
            results.sort(key=lambda item: (item.metadata or {}).get("semantic_similarity", 0.0), reverse=True)
            return results

        def ranking_key(item: VectorSearchResult):
            metadata = item.metadata or {}
            semantic = float(metadata.get("semantic_similarity", 0.0))
            location_score = float(metadata.get("location_score", 0.0))
            combined = (0.8 * semantic) + (0.2 * location_score)
            return combined

        results.sort(key=ranking_key, reverse=True)
        return results

    @staticmethod
    def _distance_to_similarity(distance: Optional[float]) -> float:
        if distance is None:
            return 0.0
        similarity = 1.0 - float(distance)
        if similarity < 0.0:
            return 0.0
        if similarity > 1.0:
            return 1.0
        return similarity

    @staticmethod
    def _distance_from_metadata(location: UserLocation, metadata: Dict[str, Any]) -> Optional[float]:
        latitude = metadata.get("latitude")
        longitude = metadata.get("longitude")
        if latitude is None or longitude is None:
            return None

        return haversine_distance_km(
            lat1=location.latitude,
            lon1=location.longitude,
            lat2=float(latitude),
            lon2=float(longitude),
        )


@lru_cache
def get_semantic_search_service() -> SemanticSearchService:
    return SemanticSearchService(
        collection_manager=get_collection_manager(),
        embedding_service=get_embedding_service(),
    )