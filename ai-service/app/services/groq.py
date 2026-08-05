from __future__ import annotations

import time
from functools import lru_cache
from typing import Any, Dict, List, Optional, Sequence, Union

import httpx
from pydantic import BaseModel, ConfigDict, Field

from app.config.settings import Settings, get_settings

RETRYABLE_STATUS_CODES = {408, 409, 425, 429, 500, 502, 503, 504}


class GroqMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: str = Field(min_length=1)
    content: str = Field(min_length=1)


class GroqResponseMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")

    role: Optional[str] = None
    content: Optional[str] = None


class GroqChoice(BaseModel):
    model_config = ConfigDict(extra="ignore")

    index: int
    message: GroqResponseMessage
    finish_reason: Optional[str] = None


class GroqChatCompletion(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: Optional[str] = None
    model: Optional[str] = None
    choices: List[GroqChoice] = Field(default_factory=list)

    @property
    def content(self) -> str:
        for choice in self.choices:
            content = choice.message.content
            if content:
                return content
        return ""


class GroqClientError(RuntimeError):
    pass


class GroqTimeoutError(GroqClientError):
    pass


class GroqRequestError(GroqClientError):
    pass


class GroqResponseError(GroqClientError):
    pass


class GroqClient:
    def __init__(self, settings: Settings) -> None:
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        if settings.groq_api_key:
            headers["Authorization"] = f"Bearer {settings.groq_api_key}"

        self._settings = settings
        self._client = httpx.Client(
            base_url=settings.groq_base_url,
            headers=headers,
            timeout=httpx.Timeout(settings.groq_timeout_seconds),
        )

    def close(self) -> None:
        self._client.close()

    def chat_completion(
        self,
        *,
        messages: Sequence[Union[GroqMessage, Dict[str, str]]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None,
    ) -> GroqChatCompletion:
        payload: Dict[str, Any] = {
            "model": model or self._settings.groq_model,
            "messages": [self._normalize_message(message) for message in messages],
        }
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if top_p is not None:
            payload["top_p"] = top_p

        response = self._request_json("POST", "/chat/completions", json=payload)
        try:
            return GroqChatCompletion.model_validate(response)
        except Exception as exc:
            raise GroqResponseError("Groq response payload was invalid.") from exc

    def generate_text(
        self,
        prompt: str,
        *,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        messages: List[GroqMessage] = []
        if system_prompt:
            messages.append(GroqMessage(role="system", content=system_prompt))
        messages.append(GroqMessage(role="user", content=prompt))
        completion = self.chat_completion(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return completion.content

    def _request_json(self, method: str, path: str, **kwargs: Any) -> Dict[str, Any]:
        last_error: Optional[Exception] = None
        for attempt in range(self._settings.groq_max_retries + 1):
            try:
                response = self._client.request(method, path, **kwargs)
                if response.status_code in RETRYABLE_STATUS_CODES:
                    raise GroqRequestError(self._describe_response_error(response))
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, dict):
                    raise GroqResponseError("Groq response must be a JSON object.")
                return payload
            except httpx.TimeoutException as exc:
                last_error = GroqTimeoutError("Groq request timed out.")
                if attempt >= self._settings.groq_max_retries:
                    raise last_error from exc
                self._sleep_before_retry(attempt)
            except httpx.RequestError as exc:
                last_error = GroqRequestError(f"Groq request failed: {exc}")
                if attempt >= self._settings.groq_max_retries:
                    raise last_error from exc
                self._sleep_before_retry(attempt)
            except httpx.HTTPStatusError as exc:
                response = exc.response
                if response.status_code in RETRYABLE_STATUS_CODES and attempt < self._settings.groq_max_retries:
                    last_error = GroqRequestError(self._describe_response_error(response))
                    self._sleep_before_retry(attempt)
                    continue
                raise GroqRequestError(self._describe_response_error(response)) from exc

        if last_error is not None:
            raise last_error
        raise GroqRequestError("Groq request failed.")

    def _sleep_before_retry(self, attempt: int) -> None:
        backoff = self._settings.groq_retry_backoff_seconds * (2**attempt)
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
            return f"Groq request failed with status {response.status_code}: {detail}"
        return f"Groq request failed with status {response.status_code}."

    @staticmethod
    def _normalize_message(message: Union[GroqMessage, Dict[str, str]]) -> Dict[str, str]:
        if isinstance(message, GroqMessage):
            return message.model_dump()
        return {"role": str(message["role"]).strip(), "content": str(message["content"]).strip()}


@lru_cache
def get_groq_client() -> GroqClient:
    return GroqClient(get_settings())