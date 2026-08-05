from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.router import api_router
from app.config.settings import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.lifespan import build_lifespan
from app.core.logging import configure_logging
from app.core.rate_limit import register_rate_limiter


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=build_lifespan(settings),
    )
    register_exception_handlers(app)
    register_rate_limiter(app, settings)
    app.include_router(health_router, include_in_schema=False)
    app.include_router(api_router)
    return app


app = create_app()
