from typing import List, Optional

from pydantic import Field

from app.schemas.api import APIModel
from app.schemas.location import UserLocation
from app.schemas.semantic_search import SemanticSearchFilters


class RecommendationRequest(APIModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)
    collection_name: Optional[str] = None
    filters: Optional[SemanticSearchFilters] = None
    location: Optional[UserLocation] = None


class RecommendationItem(APIModel):
    vendor_id: int
    vendor_name: str
    city: Optional[str] = None
    locality: Optional[str] = None
    category: Optional[str] = None
    average_rating: Optional[float] = None
    review_count: Optional[int] = None
    semantic_similarity: float = Field(ge=0.0, le=1.0)
    final_score: float = Field(ge=0.0, le=1.0)
    distance_km: Optional[float] = None


class RecommendationResponse(APIModel):
    rankings: List[RecommendationItem] = Field(default_factory=list)