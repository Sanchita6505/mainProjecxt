# Architecture Context

## Stack

| Layer | Technology | Role |
| ----- | ---------- | ---- |
| Framework | FastAPI + Python | HTTP API service for AI workflows |
| Schemas | Pydantic | Request/response validation and typed contracts |
| Embeddings | Sentence Transformers with `BAAI/bge-small-en-v1.5` | Zero-cost review and query vector generation; `BAAI/bge-base-en-v1.5` is the optional higher-resource alternative |
| Vector DB | ChromaDB | Semantic review and vendor-context retrieval |
| LLM | Groq API | Primary LLM inference provider |
| LLM Fallback | Ollama | Local fallback model provider |
| Orchestration | LangChain | Retrieval, prompt composition, and model-chain utilities |
| Persistence | SQLAlchemy + Alembic | AI service metadata where local persistence is required |
| Deployment | Docker Compose | Local and production service orchestration |

## System Boundaries

- `app/api/` - FastAPI routers for chat, recommendations, embeddings, search, sentiment, summaries, moderation, and health.
- `app/core/` - Application startup, dependency wiring, security for service-to-service access, errors, logging, and shared constants.
- `app/config/` - Environment settings and provider configuration.
- `app/database/` - SQLAlchemy session setup, Alembic integration, and AI-service metadata repositories.
- `app/embeddings/` - BGE embedding model loading, batching, normalization, semantic-aware chunking, and embedding generation.
- `app/vectorstore/` - ChromaDB collection management, upserts, deletes, filtering, and similarity search.
- `app/llm/` - Groq and Ollama clients, provider routing, retries, timeout handling, and fallback policy.
- `app/rag/` - Retrieval pipeline, context assembly, prompt execution, and grounded answer formatting.
- `app/recommendation/` - Ranking algorithms and recommendation feature weighting.
- `app/sentiment/` - Review sentiment extraction and dimension-level scoring.
- `app/summarization/` - Vendor review summaries and concise insight generation.
- `app/moderation/` - Spam, duplicate, copy-paste, and AI-generated review detection.
- `app/prompts/` - Prompt templates and prompt versioning.
- `app/schemas/` - Pydantic request, response, and internal contract models.
- `app/models/` - SQLAlchemy models for AI-owned metadata if required.
- `app/services/` - Application services that compose domain workflows.
- `app/workers/` - Background workers for embedding sync and batch jobs.
- `app/utils/` - Pure helpers with no provider-specific side effects.
- `tests/` - Unit and integration tests for AI workflows.

## Storage Model

- **ChromaDB**: Review embeddings, vendor context vectors, metadata filters, collection state, and semantic retrieval indexes.
- **Vector metadata**: Each review chunk stores `vendor_id`, `food_item`, `location`, `category`, `rating`, `review_date`, `user_id`, `review_id`, `chunk_id`, `chunk_index`, and source text boundaries for filtering and traceability.
- **PostgreSQL through backend**: Source-of-truth user, vendor, review, rating, menu, area, city, image, favorite, and chat data. AI service should not replace backend ownership.
- **AI metadata database**: Optional local SQLAlchemy-managed records for prompt versions, provider events, indexing state, batch jobs, and evaluation artifacts.
- **Model/provider configuration**: Environment variables control Groq credentials, Ollama host, embedding model name, vector collection names, timeouts, and feature flags.

## Auth and Access Model

- AI endpoints are service-to-service APIs intended for the Node.js backend, not direct browser use.
- Backend supplies authenticated and authorized user/vendor context in requests.
- AI service validates service credentials, request schemas, and allowed operation modes.
- AI service must not make independent authorization decisions about customer, vendor, or admin ownership unless the backend contract explicitly supplies the required facts.

## Invariants

1. ChromaDB vector records must be traceable to source review/vendor IDs, chunk IDs, and metadata supplied by the backend.
2. RAG answers must be grounded in retrieved platform data and must not invent vendor facts.
3. LLM provider failures must return controlled errors or use configured fallback behavior.
4. Prompt templates and ranking behavior must be versioned or documented when changed.
5. AI service must not become the source of truth for relational business data.
