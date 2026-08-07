from typing import List, Optional

from pydantic import Field

from app.schemas.api import APIModel


class EmbeddingGenerateRequest(APIModel):
    text: str = Field(min_length=1)


class EmbeddingGenerateResponse(APIModel):
    embedding: List[float]
    dimensions: int = Field(ge=1)
    model: str = Field(min_length=1)


class EmbeddingsRebuildRequest(APIModel):
    limit: int = Field(default=100, ge=1, le=5000)
    collection_name: Optional[str] = None


class EmbeddingsRebuildResponse(APIModel):
    collection_name: str = Field(min_length=1)
    processed_reviews: int = Field(ge=0)
    embedded_reviews: int = Field(ge=0)
    skipped_reviews: int = Field(ge=0)


class BulkImportResponse(APIModel):
    collection_name: str = Field(min_length=1)
    inserted_reviews: int = Field(ge=0)
    embedded_reviews: int = Field(ge=0)
    skipped_reviews: int = Field(ge=0)


class SingleReviewCreateRequest(APIModel):
    review_id: int = Field(ge=1)
    vendor_id: int = Field(ge=1)
    text: str = Field(min_length=1)
    rating: Optional[float] = None
    review_date: Optional[str] = None
    user_id: Optional[int] = None
    collection_name: Optional[str] = None


class SingleReviewCreateResponse(APIModel):
    collection_name: str = Field(min_length=1)
    inserted_reviews: int = Field(ge=0)
    embedded_reviews: int = Field(ge=0)
    skipped_reviews: int = Field(ge=0)
    embedding_id: Optional[str] = None