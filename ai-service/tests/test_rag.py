import unittest
from unittest.mock import patch

from app.services.rag import RAGService


class DummyResult:
    def __init__(self, document, metadata=None):
        self.document = document
        self.metadata = metadata or {}


class RAGServiceTests(unittest.TestCase):
    def test_builds_context_and_uses_llm_response(self):
        service = RAGService()
        with patch("app.services.llm_router.get_groq_client") as fake_groq:
            fake_groq.return_value.generate_text.return_value = "A great place for biryani"
            with patch("app.services.llm_router.get_ollama_client") as fake_ollama:
                fake_ollama.return_value.generate_text.return_value = "fallback"
                response = service.generate_response(
                    query="Where can I eat biryani?",
                    search_results=[DummyResult("A vendor serves biryani", {"vendor_name": "Biryani House"})],
                )

        self.assertIn("biryani", response.lower())
        self.assertTrue(any(word in response.lower() for word in ["house", "vendor", "spot", "option"]))


if __name__ == "__main__":
    unittest.main()
