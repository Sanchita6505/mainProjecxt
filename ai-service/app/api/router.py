from fastapi import APIRouter

from app.api.embeddings import router as embeddings_router
from app.api.health import router as health_router
from app.api.rag import router as rag_router
from app.api.recommendation import router as recommendation_router
from app.api.semantic_search import router as semantic_search_router
from app.api.summarization import router as summarization_router
from app.config.constants import API_V1_PREFIX

api_router = APIRouter(prefix=API_V1_PREFIX)
api_router.include_router(health_router)
api_router.include_router(embeddings_router)
api_router.include_router(semantic_search_router)
api_router.include_router(recommendation_router)
api_router.include_router(rag_router)
api_router.include_router(summarization_router)
