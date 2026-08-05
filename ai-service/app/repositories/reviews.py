from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import ReadOnlyRepository


class ReviewRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    review_id: int
    vendor_id: int
    user_id: Optional[int] = None
    rating: Optional[float] = None
    review_text: str
    review_date: Optional[date] = None


class ReviewRepository(ReadOnlyRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_vendor_id(self, vendor_id: int, limit: int = 100) -> List[ReviewRecord]:
        result = await self.session.execute(
            text(
                """
                SELECT id AS review_id, vendor_id, user_id, rating, review_text, review_date
                FROM reviews
                WHERE vendor_id = :vendor_id
                ORDER BY review_date DESC NULLS LAST, id DESC
                LIMIT :limit
                """
            ),
            {"vendor_id": vendor_id, "limit": limit},
        )
        return [ReviewRecord.model_validate(row._mapping) for row in result]

    async def list_recent(self, limit: int = 100) -> List[ReviewRecord]:
        result = await self.session.execute(
            text(
                """
                SELECT id AS review_id, vendor_id, user_id, rating, review_text, review_date
                FROM reviews
                ORDER BY review_date DESC NULLS LAST, id DESC
                LIMIT :limit
                """
            ),
            {"limit": limit},
        )
        return [ReviewRecord.model_validate(row._mapping) for row in result]
