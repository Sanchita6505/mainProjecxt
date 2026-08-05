# DilliBites AI Service

DilliBites AI Service is a FastAPI-based backend for food discovery and intelligent vendor recommendations. It combines semantic search, vector embeddings, location-aware ranking, LLM routing, RAG-based chat, and review summarization in a single service.

## What this service does

- Stores and queries review embeddings using ChromaDB
- Builds semantic search results from review text
- Ranks vendors using deterministic scoring and optional location data
- Routes requests between Groq and Ollama with fallback logic
- Supports grounded chat responses using retrieved context
- Summarizes vendor reviews into concise natural-language insights

## Architecture overview

The service is organized around a small set of core layers:

- API layer: FastAPI routers under `app/api`
- Service layer: business logic for embeddings, search, recommendations, routing, RAG, and summarization
- Repository layer: database access for vendors and reviews
- Vector store layer: Chroma-based collection management and similarity search
- Configuration layer: environment-driven settings via `app/config`

## Tech stack

- Python 3.8+
- FastAPI
- Pydantic + Pydantic Settings
- SQLAlchemy + async PostgreSQL access
- ChromaDB for vector storage
- httpx for LLM client calls
- Loguru for structured logging
- SlowAPI for rate limiting

## Project structure

- `app/api` – REST endpoints
- `app/services` – domain logic and orchestration
- `app/repositories` – database repository patterns
- `app/vectorstore` – Chroma integration and vector operations
- `app/schemas` – request/response models
- `app/config` – settings and constants
- `tests` – regression tests for LLM routing and RAG behavior

## Environment setup

This project uses a Python virtual environment and a standard editable install.

### 1) Create and activate a virtual environment

```bash
python -m venv .venv
.venv\Scripts\activate
```

On Linux/macOS:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 2) Install dependencies

The project is defined in `pyproject.toml`, so the correct install command is:

```bash
pip install -e .
```

This installs the package in editable mode so local code changes are reflected immediately.

### 3) Configure environment variables

The service reads settings from environment variables using the `AI_SERVICE_` prefix.

Recommended variables:

```bash
AI_SERVICE_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dillibites
AI_SERVICE_GROQ_API_KEY=your_groq_key
AI_SERVICE_GROQ_BASE_URL=https://api.groq.com/openai/v1
AI_SERVICE_OLLAMA_BASE_URL=http://localhost:11434
AI_SERVICE_CHROMA_PERSIST_DIRECTORY=.chroma
```

## Running the service

Start the API server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You can also run the app module directly if preferred:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API endpoints

### Health

- `GET /health`

### Semantic search

- `POST /api/v1/semantic-search/query`

Example request payload:

```json
{
  "query": "spicy food near me",
  "top_k": 5,
  "filters": {
    "category": "street food"
  }
}
```

### Recommendations

- `POST /api/v1/recommendations/rank`

### RAG chat

- `POST /api/v1/rag/chat`

Example payload:

```json
{
  "query": "Where can I find good biryani?",
  "top_k": 3
}
```

### Review summaries

- `POST /api/v1/summaries/review`

Example payload:

```json
{
  "vendor_id": 42,
  "limit": 10
}
```

### Bulk CSV import

- `POST /api/v1/embeddings/bulk-import`

This endpoint accepts an uploaded CSV file, inserts review rows into PostgreSQL, and then generates embeddings for the inserted review text in ChromaDB.

Expected CSV columns:

- `vendor_id` (required for insertion into the reviews table)
- `review_text` (required)
- `rating` (optional)
- `review_date` (optional, ISO format such as `2026-01-15`)
- `user_id` (optional)

Example usage:

- Send a `multipart/form-data` request with a file field named `file`.
- The file should be a CSV with the columns above.

### Single review import

- `POST /api/v1/embeddings/reviews`

This endpoint creates one new review and stores its embedding immediately.

Example payload:

```json
{
  "vendor_id": 42,
  "review_text": "Excellent food and fast service.",
  "rating": 4.5,
  "review_date": "2026-08-06",
  "user_id": 101
}
```

The import process:

1. Parses the uploaded CSV file or single review payload.
2. Inserts the review row into the `reviews` table.
3. Generates an embedding for the review text.
4. Upserts the embedding into ChromaDB with review metadata.

## Data model and metadata notes

### Review records

Reviews are read from the database and mapped into structured review objects with fields such as:

- `review_id`
- `vendor_id`
- `user_id`
- `rating`
- `review_text`
- `review_date`

### Embeddings

The embedding pipeline processes review text and stores vector records with:

- `record_id`
- `embedding`
- `document`
- `metadata`

Embedded metadata typically includes:

- `review_id`
- `vendor_id`
- `rating`
- `review_date`
- `vendor_name`
- `city`
- `locality`
- `category`
- `average_rating`
- `review_count`

These metadata fields are used for filtering and ranking during semantic search and recommendation generation.

## Development and testing

Run the regression tests:

```bash
python -m unittest tests.test_llm_router tests.test_rag
```

Run a compile check:

```bash
python -m compileall app
```

## Notes

- A PostgreSQL database and Chroma vector store are required for full functionality.
- Groq and Ollama are optional; the LLM router falls back gracefully if one provider is unavailable.
- The current implementation is intentionally lightweight and production-friendly, with deterministic ranking and clear fallback behavior.
