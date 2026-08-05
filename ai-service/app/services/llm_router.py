from __future__ import annotations

from typing import Optional

from app.config.settings import get_settings
from app.services.groq import get_groq_client
from app.services.ollama import get_ollama_client


class LLMRouterService:
    def __init__(self, settings=None, groq_client=None, ollama_client=None) -> None:
        self._settings = settings or get_settings()
        self._groq_client = groq_client or get_groq_client()
        self._ollama_client = ollama_client or get_ollama_client()

    def generate(self, prompt: str, *, system_prompt: Optional[str] = None) -> str:
        if self._settings.groq_api_key:
            try:
                return self._groq_client.generate_text(prompt, system_prompt=system_prompt)
            except Exception:
                pass

        try:
            return self._ollama_client.generate_text(prompt, system_prompt=system_prompt)
        except Exception:
            return self._fallback_response(prompt)

    def _fallback_response(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "spicy" in prompt_lower or "heat" in prompt_lower:
            return "Try a spicy street-food spot with bold flavors and a local review base."
        if "biryani" in prompt_lower:
            return "Look for a well-reviewed biryani vendor with strong local ratings."
        return "I can help you find a highly rated local food spot based on your query."
