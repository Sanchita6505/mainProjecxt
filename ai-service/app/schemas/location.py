from typing import Optional

from pydantic import Field

from app.schemas.api import APIModel


class UserLocation(APIModel):
    city: Optional[str] = None
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)