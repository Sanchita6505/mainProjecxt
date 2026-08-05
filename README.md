# DilliBites AI

DilliBites AI is an MVP street food recommendation platform with a Next.js frontend, Node.js backend API, Python FastAPI AI service, PostgreSQL, Redis, ChromaDB, and optional Ollama fallback models.

## Services

| Service | Path | Port | Responsibility |
| --- | --- | --- | --- |
| Frontend | `frontend/` | `3000` | Customer, vendor, and admin web application. |
| Backend API | `backend/` | `4000` | Public API boundary, auth, business logic, persistence, cache, queues, and AI orchestration. |
| AI Service | `ai-service/` | `8000` | Embeddings, semantic search, RAG, recommendations, sentiment, summaries, and moderation. |
| PostgreSQL | Compose service `postgres` | `5432` | Relational source of truth. |
| Redis | Compose service `redis` | `6379` | Cache, rate limiting, and queue backing store. |
| ChromaDB | Compose service `chroma` | `8001` | Vector storage for AI service. |
| Ollama | Compose service `ollama` | `11434` | Optional local LLM fallback. |

## Local Setup

1. Copy environment templates and fill local values:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```

2. Install services independently:

```bash
cd frontend && npm install
cd ../backend && npm install
cd ../ai-service && uv sync
```

3. Start the full local platform with Docker Compose:

```bash
docker compose up --build
```

4. Or run services directly while using Compose for dependencies:

```bash
cd frontend && npm run dev
cd backend && npm run dev
cd ai-service && fastapi dev main.py --host 0.0.0.0 --port 8000
```

## Service URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Backend health: `http://localhost:4000/health`
- Backend readiness: `http://localhost:4000/ready`
- AI service: `http://localhost:8000`
- ChromaDB: `http://localhost:8001`

## Secret Handling

Do not commit real `.env` files, API keys, JWT secrets, database passwords, local vector data, logs, dependency folders, or generated build output. Commit only `.env.example` templates with safe development defaults.
