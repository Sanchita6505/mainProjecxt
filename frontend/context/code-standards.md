# Code Standards

## General

- Keep AI workflows modular: API routers validate, services orchestrate, provider clients call external systems, and pure logic stays testable.
- Prefer deterministic code for ranking, filtering, and schema transformation.
- Keep prompt text, retrieval settings, and model routing explicit and reviewable.
- Log enough metadata to debug retrieval and provider failures without storing sensitive user secrets.
- Fail closed for malformed requests and unsupported operation modes.

## Python

- Use type hints for all public functions.
- Use Pydantic models for API boundaries and structured internal contracts.
- Avoid untyped dictionaries for core pipeline data once schema shape is known.
- Keep provider-specific exceptions wrapped in service-level errors.
- Prefer small functions for embedding preparation, retrieval filters, ranking features, and response shaping.

## FastAPI

- Organize routes by capability: embeddings, semantic search, recommendations, chat, sentiment, summaries, moderation, and health.
- Validate every request body and query parameter with Pydantic.
- Keep routers thin; business logic belongs in services.
- Use dependency injection for settings, vector store clients, model clients, and database sessions.
- Return stable response schemas for backend integration.

## Embeddings and Chunking

- Use `BAAI/bge-small-en-v1.5` as the default embedding model for zero-cost CPU-capable retrieval.
- Support `BAAI/bge-base-en-v1.5` as an opt-in higher-resource model through configuration.
- Use a recursive character text splitter with semantic-aware boundaries.
- Target 350-450 tokens per chunk, approximately 700-900 characters.
- Use 60-80 token overlap, approximately 120-160 characters, for longer reviews.
- Keep normal short street food reviews as a single chunk.
- Split longer reviews at sentence or paragraph boundaries before falling back to character limits.
- Preserve chunk metadata for filtering, source traceability, and RAG citations.

## Styling

- AI service has no UI styling responsibilities.
- Any text returned for display should be concise, source-aware, and suitable for frontend rendering.
- Do not include markdown-heavy or UI-specific formatting in API responses unless the contract requires it.

## API Routes

- Version public service contracts if breaking changes are introduced.
- Include request IDs or trace metadata when supplied by the backend.
- Support idempotent embedding upserts for review sync jobs.
- Return structured errors for validation failure, no context found, provider timeout, and provider unavailable cases.
- Keep AI service endpoints private to backend infrastructure.

## Data and Storage

- Store vectors and retrieval metadata in ChromaDB.
- Include `vendor_id`, `food_item`, `location`, `category`, `rating`, `review_date`, `user_id`, `review_id`, `chunk_id`, and `chunk_index` in vector metadata when available.
- Use backend-provided IDs as stable source identifiers.
- Do not store raw JWTs, or API keys.
- Do not treat generated summaries as the only copy of review truth.
- Keep SQLAlchemy-managed data limited to AI-owned metadata and operational state.
- Use Alembic for local AI metadata schema changes.

## File Organization

- `app/api/` - FastAPI route modules.
- `app/core/` - App lifecycle, dependencies, logging, errors, and service auth.
- `app/config/` - Settings and environment parsing.
- `app/database/` - SQLAlchemy, Alembic, and AI metadata repositories.
- `app/embeddings/` - Sentence Transformer models and embedding utilities.
- `app/vectorstore/` - ChromaDB collections and search logic.
- `app/llm/` - Groq, Ollama, and fallback routing.
- `app/rag/` - Retrieval-augmented generation pipelines.
- `app/recommendation/` - Ranking features and scoring.
- `app/sentiment/` - Sentiment extraction.
- `app/summarization/` - Review summary generation.
- `app/moderation/` - Fake review and spam detection.
- `app/prompts/` - Prompt templates and versions.
- `app/schemas/` - Pydantic models.
- `app/models/` - SQLAlchemy models.
- `app/services/` - Workflow orchestration services.
- `app/workers/` - Background jobs and batch sync.
- `app/utils/` - Pure helpers.
