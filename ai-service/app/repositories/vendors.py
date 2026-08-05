from typing import List, Optional

from pydantic import BaseModel, ConfigDict
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import ReadOnlyRepository


class VendorRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    vendor_id: int
    name: str
    city: Optional[str] = None
    locality: Optional[str] = None
    category: Optional[str] = None
    average_rating: Optional[float] = None
    review_count: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class VendorRepository(ReadOnlyRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def get_by_id(self, vendor_id: int) -> Optional[VendorRecord]:
        result = await self.session.execute(
            text(
                """
                SELECT id AS vendor_id, name, city, locality, category, average_rating, review_count
                FROM vendors
                WHERE id = :vendor_id
                """
            ),
            {"vendor_id": vendor_id},
        )
        row = result.mappings().first()
        if not row:
            return None

        data = dict(row)
        try:
            geo_result = await self.session.execute(
                text(
                    """
                    SELECT latitude, longitude
                    FROM vendors
                    WHERE id = :vendor_id
                    """
                ),
                {"vendor_id": vendor_id},
            )
            geo_row = geo_result.mappings().first()
            if geo_row:
                data["latitude"] = geo_row.get("latitude")
                data["longitude"] = geo_row.get("longitude")
        except SQLAlchemyError:
            # Keep compatibility with schemas where latitude/longitude are absent.
            pass

        return VendorRecord.model_validate(data)

    async def list_active(self, limit: int = 100) -> List[VendorRecord]:
        result = await self.session.execute(
            text(
                """
                SELECT id AS vendor_id, name, city, locality, category, average_rating, review_count
                FROM vendors
                ORDER BY review_count DESC NULLS LAST, average_rating DESC NULLS LAST
                LIMIT :limit
                """
            ),
            {"limit": limit},
        )
        return [VendorRecord.model_validate(row) for row in result.mappings()]
