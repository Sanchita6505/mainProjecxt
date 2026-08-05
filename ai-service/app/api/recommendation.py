from fastapi import APIRouter, Depends

from app.config.settings import Settings, get_settings
from app.schemas.api import APIResponse
from app.schemas.recommendation import RecommendationItem, RecommendationRequest, RecommendationResponse
from app.services.recommendation import RecommendationService, get_recommendation_service

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/rank", response_model=APIResponse[RecommendationResponse])
def rank_recommendations(
    payload: RecommendationRequest,
    settings: Settings = Depends(get_settings),
    service: RecommendationService = Depends(get_recommendation_service),
) -> APIResponse[RecommendationResponse]:
    collection_name = payload.collection_name or settings.chroma_collection_name
    rankings = service.rank_vendors(
        query=payload.query,
        top_k=payload.top_k,
        collection_name=collection_name,
        filters=payload.filters,
        location=payload.location,
    )
    return APIResponse(
        data=RecommendationResponse(
            rankings=[
                RecommendationItem(
                    vendor_id=item.vendor_id,
                    vendor_name=item.vendor_name,
                    city=item.city,
                    locality=item.locality,
                    category=item.category,
                    average_rating=item.average_rating,
                    review_count=item.review_count,
                    semantic_similarity=item.semantic_similarity,
                    final_score=item.final_score,
                    distance_km=item.distance_km,
                )
                for item in rankings
            ]
        )
    )