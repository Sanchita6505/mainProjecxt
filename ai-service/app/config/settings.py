from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.config.constants import (
    ALLOWED_CHROMA_DISTANCE_METRICS,
    ALLOWED_ENVIRONMENTS,
    ALLOWED_LOG_LEVELS,
    APP_VERSION,
    DEFAULT_CHROMA_COLLECTION_NAME,
    DEFAULT_CHROMA_DISTANCE_METRIC,
    DEFAULT_CHROMA_PERSIST_DIRECTORY,
    DEFAULT_APP_NAME,
    DEFAULT_ENVIRONMENT,
    DEFAULT_DATABASE_ECHO,
    DEFAULT_DATABASE_URL,
    DEFAULT_GROQ_BASE_URL,
    DEFAULT_GROQ_API_KEY,
    DEFAULT_GROQ_MAX_RETRIES,
    DEFAULT_GROQ_MODEL,
    DEFAULT_GROQ_RETRY_BACKOFF_SECONDS,
    DEFAULT_GROQ_TIMEOUT_SECONDS,
    DEFAULT_LOG_LEVEL,
    DEFAULT_OLLAMA_BASE_URL,
    DEFAULT_OLLAMA_MAX_RETRIES,
    DEFAULT_OLLAMA_MODEL,
    DEFAULT_OLLAMA_RETRY_BACKOFF_SECONDS,
    DEFAULT_OLLAMA_TIMEOUT_SECONDS,
    DEFAULT_GLOBAL_RATE_LIMIT,
    DEFAULT_RATE_LIMIT_ENABLED,
    DEFAULT_SERVER_HOST,
    DEFAULT_SERVER_PORT,
    ENV_FILE,
    ENV_PREFIX,
)

Environment = Literal["local", "development", "test", "staging", "production"]
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
ChromaDistanceMetric = Literal["cosine", "l2", "ip"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=False,
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        env_prefix=ENV_PREFIX,
        extra="ignore",
    )

    app_name: str = Field(default=DEFAULT_APP_NAME, min_length=1)
    app_version: str = Field(default=APP_VERSION, min_length=1)
    environment: Environment = Field(default=DEFAULT_ENVIRONMENT)
    log_level: LogLevel = Field(default=DEFAULT_LOG_LEVEL)
    server_host: str = Field(default=DEFAULT_SERVER_HOST, min_length=1)
    server_port: int = Field(default=DEFAULT_SERVER_PORT, ge=1, le=65535)
    rate_limit_enabled: bool = Field(default=DEFAULT_RATE_LIMIT_ENABLED)
    global_rate_limit: str = Field(default=DEFAULT_GLOBAL_RATE_LIMIT, min_length=1)
    database_url: PostgresDsn = Field(default=DEFAULT_DATABASE_URL)
    database_echo: bool = Field(default=DEFAULT_DATABASE_ECHO)
    groq_api_key: str = Field(default=DEFAULT_GROQ_API_KEY)
    groq_base_url: str = Field(default=DEFAULT_GROQ_BASE_URL, min_length=1)
    groq_model: str = Field(default=DEFAULT_GROQ_MODEL, min_length=1)
    groq_timeout_seconds: float = Field(default=DEFAULT_GROQ_TIMEOUT_SECONDS, gt=0)
    groq_max_retries: int = Field(default=DEFAULT_GROQ_MAX_RETRIES, ge=0)
    groq_retry_backoff_seconds: float = Field(default=DEFAULT_GROQ_RETRY_BACKOFF_SECONDS, ge=0)
    ollama_base_url: str = Field(default=DEFAULT_OLLAMA_BASE_URL, min_length=1)
    ollama_model: str = Field(default=DEFAULT_OLLAMA_MODEL, min_length=1)
    ollama_timeout_seconds: float = Field(default=DEFAULT_OLLAMA_TIMEOUT_SECONDS, gt=0)
    ollama_max_retries: int = Field(default=DEFAULT_OLLAMA_MAX_RETRIES, ge=0)
    ollama_retry_backoff_seconds: float = Field(default=DEFAULT_OLLAMA_RETRY_BACKOFF_SECONDS, ge=0)
    chroma_persist_directory: str = Field(default=DEFAULT_CHROMA_PERSIST_DIRECTORY, min_length=1)
    chroma_collection_name: str = Field(default=DEFAULT_CHROMA_COLLECTION_NAME, min_length=1)
    chroma_distance_metric: ChromaDistanceMetric = Field(default=DEFAULT_CHROMA_DISTANCE_METRIC)

    @field_validator("environment", mode="before")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        environment = str(value).strip().lower()
        if environment not in ALLOWED_ENVIRONMENTS:
            allowed = ", ".join(ALLOWED_ENVIRONMENTS)
            raise ValueError(f"environment must be one of: {allowed}")
        return environment

    @field_validator("log_level", mode="before")
    @classmethod
    def normalize_log_level(cls, value: str) -> str:
        log_level = str(value).strip().upper()
        if log_level not in ALLOWED_LOG_LEVELS:
            allowed = ", ".join(ALLOWED_LOG_LEVELS)
            raise ValueError(f"log_level must be one of: {allowed}")
        return log_level

    @field_validator("chroma_distance_metric", mode="before")
    @classmethod
    def normalize_chroma_distance_metric(cls, value: str) -> str:
        metric = str(value).strip().lower()
        if metric not in ALLOWED_CHROMA_DISTANCE_METRICS:
            allowed = ", ".join(ALLOWED_CHROMA_DISTANCE_METRICS)
            raise ValueError(f"chroma_distance_metric must be one of: {allowed}")
        return metric

    @field_validator("groq_api_key", "groq_base_url", "groq_model", mode="before")
    @classmethod
    def strip_groq_strings(cls, value: str) -> str:
        return str(value).strip()

    @field_validator("ollama_base_url", "ollama_model", mode="before")
    @classmethod
    def strip_ollama_strings(cls, value: str) -> str:
        return str(value).strip()

    @field_validator("groq_base_url", "ollama_base_url", mode="after")
    @classmethod
    def normalize_base_urls(cls, value: str) -> str:
        return value.rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()
