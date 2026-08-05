from fastapi import APIRouter, Depends

from app.config.settings import Settings, get_settings
from app.core.rate_limit import limiter
from app.schemas.api import APIResponse
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=APIResponse[HealthResponse])
@limiter.exempt
def health_check(settings: Settings = Depends(get_settings)) -> APIResponse[HealthResponse]:
    return APIResponse(
        data=HealthResponse(
            status="ok",
            service=settings.app_name,
            version=settings.app_version,
            environment=settings.environment,
        ),
    )
