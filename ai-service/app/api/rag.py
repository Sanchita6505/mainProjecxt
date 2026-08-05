from fastapi import APIRouter, Depends

from app.config.settings import Settings, get_settings
from app.schemas.api import APIResponse
from app.schemas.semantic_search import SemanticSearchItem
from app.services.rag import RAGService
from app.services.semantic_search import SemanticSearchService, get_semantic_search_service

router = APIRouter(prefix="/rag", tags=["rag"])


class RAGRequest:
    pass


@router.post("/chat", response_model=APIResponse[dict])
def rag_chat(
    payload: dict,
    settings: Settings = Depends(get_settings),
    search_service: SemanticSearchService = Depends(get_semantic_search_service),
) -> APIResponse[dict]:
    query = str(payload.get("query", ""))
    search_results = search_service.search(
        query=query,
        top_k=int(payload.get("top_k", 3)),
        collection_name=payload.get("collection_name") or settings.chroma_collection_name,
        filters=None,
        location=None,
    )
    response_text = RAGService().generate_response(query=query, search_results=search_results)
    return APIResponse(data={"response": response_text, "context": [
        {
            "vendor_name": (result.metadata or {}).get("vendor_name"),
            "document": result.document,
        }
        for result in search_results[:3]
    ]})
