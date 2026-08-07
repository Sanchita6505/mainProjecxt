from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import Settings, get_settings
from app.database.session import get_session
from app.schemas.api import APIResponse
from app.schemas.embeddings import (
    BulkImportResponse,
    EmbeddingGenerateRequest,
    EmbeddingGenerateResponse,
    EmbeddingsRebuildRequest,
    EmbeddingsRebuildResponse,
    SingleReviewCreateRequest,
    SingleReviewCreateResponse,
)
from app.services.embeddings import EmbeddingService, get_embedding_service

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("/generate", response_model=APIResponse[EmbeddingGenerateResponse])
def generate_embedding(
    payload: EmbeddingGenerateRequest,
    service: EmbeddingService = Depends(get_embedding_service),
) -> APIResponse[EmbeddingGenerateResponse]:
    embedding = service.generate_embedding(payload.text)
    return APIResponse(
        data=EmbeddingGenerateResponse(
            embedding=embedding,
            dimensions=len(embedding),
            model="onnx-minilm-l6-v2",
        )
    )


@router.post("/rebuild", response_model=APIResponse[EmbeddingsRebuildResponse])
async def rebuild_embeddings(
    payload: EmbeddingsRebuildRequest,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    service: EmbeddingService = Depends(get_embedding_service),
) -> APIResponse[EmbeddingsRebuildResponse]:
    collection_name = payload.collection_name or settings.chroma_collection_name
    result = await service.rebuild_embeddings(
        session=session,
        collection_name=collection_name,
        limit=payload.limit,
    )
    return APIResponse(
        data=EmbeddingsRebuildResponse(
            collection_name=result.collection_name,
            processed_reviews=result.processed_reviews,
            embedded_reviews=result.embedded_reviews,
            skipped_reviews=result.skipped_reviews,
        )
    )


@router.post("/bulk-import", response_model=APIResponse[BulkImportResponse])
async def bulk_import(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    service: EmbeddingService = Depends(get_embedding_service),
) -> APIResponse[BulkImportResponse]:
    collection_name = settings.chroma_collection_name
    content = await file.read()
    result = await service.bulk_import_csv(
        session=session,
        csv_text=content.decode("utf-8"),
        collection_name=collection_name,
    )
    return APIResponse(
        data=BulkImportResponse(
            collection_name=result.collection_name,
            inserted_reviews=result.processed_reviews,
            embedded_reviews=result.embedded_reviews,
            skipped_reviews=result.skipped_reviews,
        )
    )


@router.post("/reviews", response_model=APIResponse[SingleReviewCreateResponse])
async def create_single_review(
    payload: SingleReviewCreateRequest,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    service: EmbeddingService = Depends(get_embedding_service),
) -> APIResponse[SingleReviewCreateResponse]:
    collection_name = payload.collection_name or settings.chroma_collection_name
    result = await service.create_single_review(
        session=session,
        review_id=payload.review_id,
        vendor_id=payload.vendor_id,
        text=payload.text,
        rating=payload.rating,
        review_date=payload.review_date,
        user_id=payload.user_id,
        collection_name=collection_name,
    )
    return APIResponse(
        data=SingleReviewCreateResponse(
            collection_name=result.collection_name,
            inserted_reviews=result.processed_reviews,
            embedded_reviews=result.embedded_reviews,
            skipped_reviews=result.skipped_reviews,
            embedding_id=result.embedding_id,
        )
    )