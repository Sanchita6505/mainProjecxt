from typing import Optional

from pydantic import Field

from app.schemas.api import APIModel


class ReviewSummaryRequest(APIModel):
    vendor_id: int = Field(ge=1)
    limit: int = Field(default=10, ge=1, le=50)


class ReviewSummaryResponse(APIModel):
    vendor_id: int
    summary: str
    review_count: int
