from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field

from app.config.settings import Settings, get_settings
from app.schemas.api import APIModel, APIResponse
from app.schemas.location import UserLocation
from app.services.rag import RAGService
from app.services.semantic_search import SemanticSearchService, get_semantic_search_service

router = APIRouter(prefix="/rag", tags=["rag"])


class RAGRequest(APIModel):
    query: str = Field(min_length=1, max_length=500)
    top_k: int = Field(default=3, ge=1, le=20)
    location: Optional[UserLocation] = None
    collection_name: Optional[str] = None


@router.post("/chat", response_model=APIResponse[dict])
def rag_chat(
    payload: RAGRequest,
    settings: Settings = Depends(get_settings),
    search_service: SemanticSearchService = Depends(get_semantic_search_service),
) -> APIResponse[dict]:
    allowed_collection = settings.chroma_collection_name
    if payload.collection_name is not None and payload.collection_name != allowed_collection:
        raise HTTPException(status_code=400, detail="Invalid collection_name.")
    search_results = search_service.search(
        query=payload.query,
        top_k=payload.top_k,
        collection_name=allowed_collection,
        filters=None,
        location=payload.location,
    )
    response_text = RAGService().generate_response(query=payload.query, search_results=search_results)
    return APIResponse(data={"response": response_text, "context": [
        {
            "vendor_name": (result.metadata or {}).get("vendor_name"),
            "document": result.document,
        }
        for result in search_results[:3]
    ]})
