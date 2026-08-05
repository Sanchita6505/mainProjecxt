from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List, Optional

from app.schemas.location import UserLocation
from app.schemas.semantic_search import SemanticSearchFilters
from app.services.semantic_search import SemanticSearchService, get_semantic_search_service


@dataclass
class RecommendationRank:
    vendor_id: int
    vendor_name: str
    city: Optional[str]
    locality: Optional[str]
    category: Optional[str]
    average_rating: Optional[float]
    review_count: Optional[int]
    semantic_similarity: float
    final_score: float
    distance_km: Optional[float]


class RecommendationService:
    def __init__(self, semantic_search_service: SemanticSearchService) -> None:
        self._semantic_search_service = semantic_search_service

    def rank_vendors(
        self,
        *,
        query: str,
        top_k: int,
        collection_name: Optional[str],
        filters: Optional[SemanticSearchFilters],
        location: Optional[UserLocation],
    ) -> List[RecommendationRank]:
        raw_results = self._semantic_search_service.search(
            query=query,
            top_k=max(top_k * 5, top_k),
            collection_name=collection_name,
            filters=filters,
            location=location,
        )

        per_vendor: Dict[int, Dict[str, object]] = {}
        for result in raw_results:
            metadata = result.metadata or {}
            vendor_id_value = metadata.get("vendor_id")
            if vendor_id_value is None:
                continue

            vendor_id = int(vendor_id_value)
            semantic_similarity = float(metadata.get("semantic_similarity", 0.0))
            existing = per_vendor.get(vendor_id)
            if existing is None or semantic_similarity > float(existing.get("semantic_similarity", 0.0)):
                per_vendor[vendor_id] = {
                    "vendor_id": vendor_id,
                    "vendor_name": str(metadata.get("vendor_name", f"Vendor {vendor_id}")),
                    "city": metadata.get("city"),
                    "locality": metadata.get("locality"),
                    "category": metadata.get("category"),
                    "average_rating": RecommendationService._to_optional_float(metadata.get("average_rating")),
                    "review_count": RecommendationService._to_optional_int(metadata.get("review_count")),
                    "semantic_similarity": semantic_similarity,
                    "distance_km": RecommendationService._to_optional_float(metadata.get("distance_km")),
                }

        vendors = list(per_vendor.values())
        if not vendors:
            return []

        max_review_count = max(int(v.get("review_count") or 0) for v in vendors)
        ranked: List[RecommendationRank] = []
        for vendor in vendors:
            semantic_similarity = float(vendor.get("semantic_similarity", 0.0))
            average_rating = vendor.get("average_rating")
            rating_score = min(max(float(average_rating or 0.0) / 5.0, 0.0), 1.0)

            review_count = int(vendor.get("review_count") or 0)
            review_count_score = (review_count / max_review_count) if max_review_count > 0 else 0.0

            final_score = (
                (0.60 * semantic_similarity)
                + (0.25 * rating_score)
                + (0.15 * review_count_score)
            )

            ranked.append(
                RecommendationRank(
                    vendor_id=int(vendor["vendor_id"]),
                    vendor_name=str(vendor["vendor_name"]),
                    city=vendor.get("city"),
                    locality=vendor.get("locality"),
                    category=vendor.get("category"),
                    average_rating=RecommendationService._to_optional_float(vendor.get("average_rating")),
                    review_count=RecommendationService._to_optional_int(vendor.get("review_count")),
                    semantic_similarity=semantic_similarity,
                    final_score=min(max(final_score, 0.0), 1.0),
                    distance_km=RecommendationService._to_optional_float(vendor.get("distance_km")),
                )
            )

        ranked.sort(key=lambda item: item.final_score, reverse=True)
        return ranked[:top_k]

    @staticmethod
    def _to_optional_float(value) -> Optional[float]:
        if value is None:
            return None
        return float(value)

    @staticmethod
    def _to_optional_int(value) -> Optional[int]:
        if value is None:
            return None
        return int(value)


@lru_cache
def get_recommendation_service() -> RecommendationService:
    return RecommendationService(get_semantic_search_service())