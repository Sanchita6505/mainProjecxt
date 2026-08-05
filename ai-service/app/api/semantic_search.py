from fastapi import APIRouter, Depends

from app.config.settings import Settings, get_settings
from app.schemas.api import APIResponse
from app.schemas.semantic_search import (
    SemanticSearchItem,
    SemanticSearchRequest,
    SemanticSearchResponse,
)
from app.services.semantic_search import SemanticSearchService, get_semantic_search_service

router = APIRouter(prefix="/semantic-search", tags=["semantic-search"])


@router.post("/query", response_model=APIResponse[SemanticSearchResponse])
def semantic_query(
    payload: SemanticSearchRequest,
    settings: Settings = Depends(get_settings),
    service: SemanticSearchService = Depends(get_semantic_search_service),
) -> APIResponse[SemanticSearchResponse]:
    collection_name = payload.collection_name or settings.chroma_collection_name
    results = service.search(
        query=payload.query,
        top_k=payload.top_k,
        collection_name=collection_name,
        filters=payload.filters,
        location=payload.location,
    )
    return APIResponse(
        data=SemanticSearchResponse(
            results=[
                SemanticSearchItem(
                    record_id=result.record_id,
                    distance=result.distance,
                    semantic_similarity=(result.metadata or {}).get("semantic_similarity"),
                    distance_km=(result.metadata or {}).get("distance_km"),
                    document=result.document,
                    metadata=result.metadata,
                )
                for result in results
            ]
        )
    )