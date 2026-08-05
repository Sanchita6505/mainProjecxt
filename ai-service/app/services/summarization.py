from __future__ import annotations

from typing import List, Optional, Sequence

from app.repositories.reviews import ReviewRecord, ReviewRepository
from app.services.llm_router import LLMRouterService
from app.database.session import SessionLocal


class ReviewSummarizationService:
    def __init__(self, llm_router_service: Optional[LLMRouterService] = None) -> None:
        self._llm_router_service = llm_router_service or LLMRouterService()

    async def summarize_vendor_reviews(self, *, vendor_id: int, limit: int = 10) -> str:
        async with SessionLocal() as session:
            repository = ReviewRepository(session)
            reviews = await repository.get_by_vendor_id(vendor_id, limit=limit)

        if not reviews:
            return "No review text is available for this vendor yet."

        prompt = self._build_prompt(reviews)
        return self._llm_router_service.generate(
            prompt,
            system_prompt="Summarize food reviews briefly and clearly.",
        )

    @staticmethod
    def _build_prompt(reviews: Sequence[ReviewRecord]) -> str:
        snippets = []
        for review in reviews[:8]:
            text = (review.review_text or "").strip()
            if text:
                snippets.append(f"- {text}")
        joined = "\n".join(snippets)
        return (
            "Summarize these customer reviews in 2 short sentences. "
            "Highlight common praise or complaints.\n"
            f"{joined}"
        )
