from __future__ import annotations

from typing import List, Optional, Sequence

from app.services.llm_router import LLMRouterService


class RAGService:
    def __init__(self, llm_router_service: Optional[LLMRouterService] = None) -> None:
        self._llm_router_service = llm_router_service or LLMRouterService()

    def generate_response(self, *, query: str, search_results: Sequence[object]) -> str:
        context = self._build_context(search_results)
        prompt = (
            f"User query: {query}\n"
            f"Relevant context:\n{context}\n"
            "Answer briefly and mention the most relevant vendor or food option."
        )
        return self._llm_router_service.generate(prompt, system_prompt="You are a helpful food discovery assistant.")

    @staticmethod
    def _build_context(search_results: Sequence[object]) -> str:
        if not search_results:
            return "No relevant results found."

        lines: List[str] = []
        for index, result in enumerate(search_results[:3], start=1):
            metadata = getattr(result, "metadata", None) or {}
            vendor_name = metadata.get("vendor_name") or "Unknown vendor"
            document = getattr(result, "document", None) or ""
            lines.append(f"{index}. {vendor_name}: {document}")
        return "\n".join(lines)
