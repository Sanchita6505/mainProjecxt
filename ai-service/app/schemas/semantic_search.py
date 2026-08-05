from typing import Any, Dict, List, Optional

from pydantic import Field

from app.schemas.api import APIModel
from app.schemas.location import UserLocation


class SemanticSearchFilters(APIModel):
    vendor_id: Optional[int] = Field(default=None, ge=1)
    city: Optional[str] = None
    locality: Optional[str] = None
    category: Optional[str] = None


class SemanticSearchRequest(APIModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)
    collection_name: Optional[str] = None
    filters: Optional[SemanticSearchFilters] = None
    location: Optional[UserLocation] = None


class SemanticSearchItem(APIModel):
    record_id: str
    distance: Optional[float] = None
    semantic_similarity: Optional[float] = None
    distance_km: Optional[float] = None
    document: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class SemanticSearchResponse(APIModel):
    results: List[SemanticSearchItem] = Field(default_factory=list)