import unittest

from app.services.llm_router import LLMRouterService


class LLMRouterTests(unittest.TestCase):
    def test_deterministic_fallback_produces_helpful_response(self):
        service = LLMRouterService()
        response = service.generate("Find me a spicy food spot")
        self.assertIn("spicy", response.lower())
        self.assertIn("food", response.lower())


if __name__ == "__main__":
    unittest.main()
