from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import ValidationError

from app.schemas.api import ErrorDetail, ErrorResponse


def _error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    details: Optional[List[ErrorDetail]] = None,
) -> JSONResponse:
    content = ErrorResponse(
        error=ErrorDetail(code=code, message=message, details=details or []),
    ).model_dump()
    return JSONResponse(status_code=status_code, content=content)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return _error_response(
        status_code=exc.status_code,
        code="http_error",
        message=str(exc.detail),
    )


async def request_validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = [
        ErrorDetail(
            code="validation_error",
            message=error["msg"],
            field=".".join(str(location) for location in error["loc"]),
        )
        for error in exc.errors()
    ]
    return _error_response(
        status_code=status.HTTP_400_BAD_REQUEST,
        code="request_validation_error",
        message="Request validation failed.",
        details=details,
    )


async def validation_exception_handler(
    request: Request,
    exc: ValidationError,
) -> JSONResponse:
    details = [
        ErrorDetail(
            code="validation_error",
            message=error["msg"],
            field=".".join(str(location) for location in error["loc"]),
        )
        for error in exc.errors()
    ]
    return _error_response(
        status_code=status.HTTP_400_BAD_REQUEST,
        code="validation_error",
        message="Validation failed.",
        details=details,
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "Unhandled exception while processing {method} {path}",
        method=request.method,
        path=request.url.path,
    )
    return _error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="internal_server_error",
        message="Internal server error.",
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, request_validation_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
