from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from loguru import logger

from app.config.settings import Settings
from app.database.session import dispose_engine, ping_database
from app.services.groq import get_groq_client
from app.services.ollama import get_ollama_client
from app.vectorstore import get_collection_manager


def build_lifespan(settings: Settings):
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        logger.info(
            "Starting {service} {version} in {environment} environment",
            service=settings.app_name,
            version=settings.app_version,
            environment=settings.environment,
        )
        await ping_database()
        logger.info("Database connectivity check succeeded")
        get_collection_manager().get_collection()
        logger.info("ChromaDB collection initialized")
        yield
        get_groq_client().close()
        get_ollama_client().close()
        await dispose_engine()
        logger.info("Stopping {service}", service=settings.app_name)

    return lifespan
