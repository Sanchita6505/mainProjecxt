from __future__ import annotations

import time
from functools import lru_cache
from typing import Any, Dict, Optional, Sequence

import httpx
from pydantic import BaseModel, ConfigDict, Field

from app.config.settings import Settings, get_settings

RETRYABLE_STATUS_CODES = {408, 409, 425, 429, 500, 502, 503, 504}


class OllamaGenerateResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    response: Optional[str] = None
    done: bool = False


class OllamaClientError(RuntimeError):
    pass


class OllamaTimeoutError(OllamaClientError):
    pass


class OllamaRequestError(OllamaClientError):
    pass


class OllamaResponseError(OllamaClientError):
    pass


class OllamaClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = httpx.Client(
            base_url=settings.ollama_base_url,
            timeout=httpx.Timeout(settings.ollama_timeout_seconds),
        )

    def close(self) -> None:
        self._client.close()

    def generate_text(
        self,
        prompt: str,
        *,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        payload: Dict[str, Any] = {
            "model": model or self._settings.ollama_model,
            "prompt": prompt,
            "stream": False,
        }
        if system_prompt:
            payload["system"] = system_prompt
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["num_predict"] = max_tokens

        response = self._request_json("POST", "/api/generate", json=payload)
        try:
            parsed = OllamaGenerateResponse.model_validate(response)
        except Exception as exc:
            raise OllamaResponseError("Ollama response payload was invalid.") from exc
        return parsed.response or ""

    def health_check(self) -> bool:
        try:
            payload = self._request_json("GET", "/api/tags")
        except OllamaClientError:
            return False
        return isinstance(payload, dict) and "models" in payload

    def _request_json(self, method: str, path: str, **kwargs: Any) -> Dict[str, Any]:
        last_error: Optional[Exception] = None
        for attempt in range(self._settings.ollama_max_retries + 1):
            try:
                response = self._client.request(method, path, **kwargs)
                if response.status_code in RETRYABLE_STATUS_CODES:
                    raise OllamaRequestError(self._describe_response_error(response))
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, dict):
                    raise OllamaResponseError("Ollama response must be a JSON object.")
                return payload
            except httpx.TimeoutException as exc:
                last_error = OllamaTimeoutError("Ollama request timed out.")
                if attempt >= self._settings.ollama_max_retries:
                    raise last_error from exc
                self._sleep_before_retry(attempt)
            except httpx.RequestError as exc:
                last_error = OllamaRequestError(f"Ollama request failed: {exc}")
                if attempt >= self._settings.ollama_max_retries:
                    raise last_error from exc
                self._sleep_before_retry(attempt)
            except httpx.HTTPStatusError as exc:
                response = exc.response
                if response.status_code in RETRYABLE_STATUS_CODES and attempt < self._settings.ollama_max_retries:
                    last_error = OllamaRequestError(self._describe_response_error(response))
                    self._sleep_before_retry(attempt)
                    continue
                raise OllamaRequestError(self._describe_response_error(response)) from exc

        if last_error is not None:
            raise last_error
        raise OllamaRequestError("Ollama request failed.")

    def _sleep_before_retry(self, attempt: int) -> None:
        backoff = self._settings.ollama_retry_backoff_seconds * (2**attempt)
        if backoff > 0:
            time.sleep(backoff)

    @staticmethod
    def _describe_response_error(response: httpx.Response) -> str:
        detail: Optional[str] = None
        try:
            body = response.json()
            if isinstance(body, dict):
                error = body.get("error")
                if isinstance(error, dict):
                    detail = error.get("message")
                else:
                    raw_message = body.get("message")
                    if isinstance(raw_message, str):
                        detail = raw_message
        except ValueError:
            detail = None

        if detail:
            return f"Ollama request failed with status {response.status_code}: {detail}"
        return f"Ollama request failed with status {response.status_code}."


@lru_cache
def get_ollama_client() -> OllamaClient:
    return OllamaClient(get_settings())
