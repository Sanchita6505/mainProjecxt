from fastapi import APIRouter, Depends

from app.schemas.api import APIResponse
from app.schemas.summarization import ReviewSummaryRequest, ReviewSummaryResponse
from app.services.summarization import ReviewSummarizationService

router = APIRouter(prefix="/summaries", tags=["summaries"])


@router.post("/review", response_model=APIResponse[ReviewSummaryResponse])
async def summarize_reviews(
    payload: ReviewSummaryRequest,
    service: ReviewSummarizationService = Depends(ReviewSummarizationService),
) -> APIResponse[ReviewSummaryResponse]:
    summary = await service.summarize_vendor_reviews(vendor_id=payload.vendor_id, limit=payload.limit)
    return APIResponse(
        data=ReviewSummaryResponse(
            vendor_id=payload.vendor_id,
            summary=summary,
            review_count=payload.limit,
        )
    )
