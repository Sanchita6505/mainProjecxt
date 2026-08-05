from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class VectorRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    record_id: str = Field(min_length=1)
    embedding: List[float] = Field(min_length=1)
    document: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class VectorSearchResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    record_id: str
    distance: Optional[float] = None
    document: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None