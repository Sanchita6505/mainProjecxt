from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from slowapi.wrappers import LimitGroup

from app.config.constants import DEFAULT_GLOBAL_RATE_LIMIT
from app.config.settings import Settings
from app.schemas.api import ErrorDetail, ErrorResponse

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[DEFAULT_GLOBAL_RATE_LIMIT],
)


def configure_limiter(settings: Settings) -> Limiter:
    limiter.enabled = settings.rate_limit_enabled
    limiter._default_limits = [
        LimitGroup(
            settings.global_rate_limit,
            get_remote_address,
            None,
            False,
            None,
            None,
            None,
            1,
            False,
        ),
    ]
    return limiter


def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded,
) -> JSONResponse:
    content = ErrorResponse(
        error=ErrorDetail(
            code="rate_limit_exceeded",
            message="Rate limit exceeded.",
        ),
    ).model_dump()
    return JSONResponse(status_code=status.HTTP_429_TOO_MANY_REQUESTS, content=content)


def register_rate_limiter(app: FastAPI, settings: Settings) -> Limiter:
    configured_limiter = configure_limiter(settings)
    app.state.limiter = configured_limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    return configured_limiter
