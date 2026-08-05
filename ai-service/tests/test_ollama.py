import unittest
from unittest.mock import patch

from app.config.settings import Settings
from app.services.ollama import OllamaClient


class DummyResponse:
    def __init__(self, payload):
        self._payload = payload
        self.status_code = 200

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


class OllamaClientTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(
            app_name="test-service",
            app_version="1.0.0",
            environment="test",
            log_level="INFO",
            server_host="127.0.0.1",
            server_port=8000,
            rate_limit_enabled=False,
            global_rate_limit="10/minute",
            database_url="postgresql+asyncpg://postgres:postgres@localhost:5432/dillibites",
            database_echo=False,
            groq_api_key="",
            groq_base_url="https://api.groq.com/openai/v1",
            groq_model="llama-3.1-8b-instant",
            groq_timeout_seconds=10.0,
            groq_max_retries=1,
            groq_retry_backoff_seconds=0.0,
            chroma_persist_directory=".chroma",
            chroma_collection_name="reviews",
            chroma_distance_metric="cosine",
            ollama_base_url="http://localhost:11434",
            ollama_model="llama3.1:8b",
            ollama_timeout_seconds=5.0,
            ollama_max_retries=1,
            ollama_retry_backoff_seconds=0.0,
        )

    def test_generate_text_uses_ollama_generate_endpoint(self):
        client = OllamaClient(self.settings)

        with patch("app.services.ollama.httpx.Client.request", return_value=DummyResponse({"response": "ok"})) as request:
            result = client.generate_text("hello")

        self.assertEqual(result, "ok")
        self.assertEqual(request.call_count, 1)
        payload = request.call_args.kwargs["json"]
        self.assertEqual(payload["prompt"], "hello")
        self.assertEqual(payload["model"], self.settings.ollama_model)

    def test_health_check_returns_true_when_server_is_available(self):
        client = OllamaClient(self.settings)

        with patch("app.services.ollama.httpx.Client.request", return_value=DummyResponse({"models": []})) as request:
            self.assertTrue(client.health_check())

        self.assertEqual(request.call_count, 1)


if __name__ == "__main__":
    unittest.main()
