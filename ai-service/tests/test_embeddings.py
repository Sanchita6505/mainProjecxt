import asyncio
import unittest

from app.services.embeddings import EmbeddingService


class FakeResult:
    def __init__(self, value):
        self._value = value

    def scalar_one_or_none(self):
        return self._value


class FakeSession:
    def __init__(self, inserted_id):
        self._inserted_id = inserted_id
        self.commits = 0
        self.executed = []

    async def execute(self, statement, params=None):
        self.executed.append((statement, params))
        return FakeResult(self._inserted_id)

    async def commit(self):
        self.commits += 1


class FakeCollectionManager:
    def __init__(self):
        self.records = []
        self.collection_name = None

    def upsert(self, records, collection_name):
        self.records.extend(records)
        self.collection_name = collection_name


class EmbeddingServiceTests(unittest.TestCase):
    def test_create_single_review_inserts_and_embeds(self):
        session = FakeSession(42)
        collection_manager = FakeCollectionManager()
        service = EmbeddingService(collection_manager)
        service.generate_embedding = lambda text: [0.1, 0.2, 0.3]

        result = asyncio.run(
            service.create_single_review(
                session=session,
                vendor_id=7,
                review_text="Excellent food and fast service",
                rating=4.5,
                review_date="2026-08-06",
                user_id=101,
                collection_name="reviews",
            )
        )

        self.assertEqual(result.processed_reviews, 1)
        self.assertEqual(result.embedded_reviews, 1)
        self.assertEqual(result.skipped_reviews, 0)
        self.assertEqual(session.commits, 1)
        self.assertEqual(collection_manager.collection_name, "reviews")
        self.assertEqual(len(collection_manager.records), 1)
        self.assertEqual(collection_manager.records[0].metadata["review_id"], 42)
        self.assertEqual(collection_manager.records[0].metadata["vendor_id"], 7)


if __name__ == "__main__":
    unittest.main()
