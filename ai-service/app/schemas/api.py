from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field


class APIModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


DataT = TypeVar("DataT")


class APIResponse(APIModel, Generic[DataT]):
    model_config = ConfigDict(extra="forbid")

    success: bool = True
    data: DataT


class ErrorDetail(APIModel):
    code: str = Field(min_length=1)
    message: str = Field(min_length=1)
    field: Optional[str] = None
    details: List["ErrorDetail"] = Field(default_factory=list)


class ErrorResponse(APIModel):
    success: bool = False
    error: ErrorDetail


class EmptyResponse(APIModel):
    metadata: Dict[str, Any] = Field(default_factory=dict)
