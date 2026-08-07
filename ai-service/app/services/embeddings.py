import csv
import io
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List, Optional

from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.reviews import ReviewRepository
from app.repositories.vendors import VendorRepository, VendorRecord
from app.vectorstore import ChromaCollectionManager, VectorRecord, get_collection_manager


@dataclass
class RebuildResult:
    collection_name: str
    processed_reviews: int
    embedded_reviews: int
    skipped_reviews: int
    embedding_id: Optional[str] = None


class EmbeddingService:
    def __init__(self, collection_manager: ChromaCollectionManager) -> None:
        self._collection_manager = collection_manager
        self._embedding_function = DefaultEmbeddingFunction()

    def generate_embedding(self, text: str) -> List[float]:
        normalized = text.strip()
        if not normalized:
            raise ValueError("text must not be empty")
        embedding = self._embedding_function([normalized])[0]
        return [float(value) for value in embedding]

    async def bulk_import_csv(
        self,
        *,
        session: AsyncSession,
        csv_text: str,
        collection_name: str,
    ) -> RebuildResult:
        reader = csv.DictReader(io.StringIO(csv_text))
        rows = list(reader)
        if not rows:
            return RebuildResult(collection_name=collection_name, processed_reviews=0, embedded_reviews=0, skipped_reviews=0)

        inserted_reviews = 0
        skipped = 0
        records: List[VectorRecord] = []

        for row in rows:
            vendor_id = self._coerce_int(row.get("vendor_id"))
            review_text = str(row.get("review_text") or "").strip()
            if not review_text:
                skipped += 1
                continue

            if vendor_id is None:
                vendor_id = 0

            review_date = self._coerce_date(row.get("review_date"))
            rating = self._coerce_float(row.get("rating"))
            user_id = self._coerce_int(row.get("user_id"))

            await session.execute(
                text(
                    """
                    INSERT INTO reviews (vendor_id, user_id, rating, review_text, review_date)
                    VALUES (:vendor_id, :user_id, :rating, :review_text, :review_date)
                    RETURNING id
                    """
                ),
                {
                    "vendor_id": vendor_id,
                    "user_id": user_id,
                    "rating": rating,
                    "review_text": review_text,
                    "review_date": review_date,
                },
            )
            inserted_reviews += 1

            review_id = None
            result = await session.execute(text("SELECT MAX(id) AS latest_id FROM reviews"))
            latest_row = result.mappings().first()
            if latest_row:
                review_id = latest_row.get("latest_id")

            if review_id is None:
                skipped += 1
                continue

            embedding = self.generate_embedding(review_text)
            metadata = {"review_id": review_id, "vendor_id": vendor_id}
            if rating is not None:
                metadata["rating"] = float(rating)
            if review_date is not None:
                metadata["review_date"] = review_date.isoformat()
            records.append(
                VectorRecord(
                    record_id=f"review:{review_id}",
                    embedding=embedding,
                    document=review_text,
                    metadata=metadata,
                )
            )

        if records:
            self._collection_manager.upsert(records, collection_name=collection_name)

        await session.commit()

        return RebuildResult(
            collection_name=collection_name,
            processed_reviews=len(rows),
            embedded_reviews=len(records),
            skipped_reviews=skipped,
        )

    async def create_single_review(
        self,
        *,
        session: AsyncSession,
        review_id: int,
        vendor_id: int,
        text: str,
        rating: Optional[float],
        review_date: Optional[str],
        user_id: Optional[int],
        collection_name: str,
    ) -> RebuildResult:
        review_date_value = self._coerce_date(review_date)
        normalized = text.strip()

        embedding = self.generate_embedding(normalized)
        metadata: Dict[str, object] = {"review_id": review_id, "vendor_id": vendor_id}
        if rating is not None:
            metadata["rating"] = float(rating)
        if review_date_value is not None:
            metadata["review_date"] = review_date_value.isoformat()

        record_id = f"review:{review_id}"
        self._collection_manager.upsert(
            [
                VectorRecord(
                    record_id=record_id,
                    embedding=embedding,
                    document=normalized,
                    metadata=metadata,
                )
            ],
            collection_name=collection_name,
        )
        return RebuildResult(collection_name=collection_name, processed_reviews=1, embedded_reviews=1, skipped_reviews=0, embedding_id=record_id)

    async def rebuild_embeddings(
        self,
        *,
        session: AsyncSession,
        collection_name: str,
        limit: int,
    ) -> RebuildResult:
        review_repository = ReviewRepository(session)
        vendor_repository = VendorRepository(session)
        reviews = await review_repository.list_recent(limit=limit)

        vendor_ids = {review.vendor_id for review in reviews}
        vendor_map: Dict[int, VendorRecord] = {}
        for vendor_id in vendor_ids:
            vendor = await vendor_repository.get_by_id(vendor_id)
            if vendor:
                vendor_map[vendor_id] = vendor

        records: List[VectorRecord] = []
        skipped = 0
        for review in reviews:
            review_text = review.review_text.strip()
            if not review_text:
                skipped += 1
                continue

            embedding = self.generate_embedding(review_text)
            vendor = vendor_map.get(review.vendor_id)
            metadata = self._build_metadata(review=review, vendor=vendor)
            records.append(
                VectorRecord(
                    record_id=f"review:{review.review_id}",
                    embedding=embedding,
                    document=review_text,
                    metadata=metadata,
                )
            )

        self._collection_manager.upsert(records, collection_name=collection_name)

        return RebuildResult(
            collection_name=collection_name,
            processed_reviews=len(reviews),
            embedded_reviews=len(records),
            skipped_reviews=skipped,
        )

    @staticmethod
    def _coerce_int(value: Optional[object]) -> Optional[int]:
        if value is None:
            return None
        if isinstance(value, int):
            return value
        try:
            return int(str(value).strip())
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _coerce_float(value: Optional[object]) -> Optional[float]:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)
        try:
            return float(str(value).strip())
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _coerce_date(value: Optional[object]):
        if value is None:
            return None
        if hasattr(value, "isoformat"):
            return value
        try:
            from datetime import date
            return date.fromisoformat(str(value).strip())
        except Exception:
            return None

    @staticmethod
    def _build_metadata(review, vendor: Optional[VendorRecord]) -> Dict[str, object]:
        metadata: Dict[str, object] = {
            "review_id": review.review_id,
            "vendor_id": review.vendor_id,
        }
        if review.rating is not None:
            metadata["rating"] = float(review.rating)
        if review.review_date is not None:
            metadata["review_date"] = review.review_date.isoformat()

        if vendor is not None:
            metadata["vendor_name"] = vendor.name
            if vendor.city:
                metadata["city"] = vendor.city
            if vendor.locality:
                metadata["locality"] = vendor.locality
            if vendor.category:
                metadata["category"] = vendor.category
            if vendor.average_rating is not None:
                metadata["average_rating"] = float(vendor.average_rating)
            if vendor.review_count is not None:
                metadata["review_count"] = int(vendor.review_count)
            if vendor.latitude is not None:
                metadata["latitude"] = float(vendor.latitude)
            if vendor.longitude is not None:
                metadata["longitude"] = float(vendor.longitude)

        return metadata


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(get_collection_manager())