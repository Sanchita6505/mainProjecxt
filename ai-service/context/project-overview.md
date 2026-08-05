# DilliBites AI Service

## Overview

The AI Service is a lightweight Python FastAPI microservice responsible for powering the intelligent features of DilliBites AI. It provides semantic food discovery, AI-powered recommendations, Retrieval-Augmented Generation (RAG), review summarization, and location-aware responses through a simple REST API.

This service is intentionally scoped for a MVP. The architecture remains modular so additional AI capabilities can be added later without major refactoring.

---

# Goals

- Semantic food discovery
- AI-powered food recommendations
- RAG-based conversational answers
- Review summarization
- LLM routing
- User location-aware recommendations
- Secure internal APIs
- Rate limiting
- Zero-cost deployment

---

# Out of Scope

The following features are intentionally excluded from the MVP:

- Fake review detection
- ML recommendation models
- Aspect-based sentiment analysis
- Background workers
- Evaluation framework
- Streaming responses
- Agent workflows
- Multi-model orchestration
- Analytics dashboard

---

# Tech Stack

## Framework

- Python 3.12+
- FastAPI
- Uvicorn
- Pydantic v2

## AI

- Groq (Primary LLM)
- Ollama (Fallback LLM)

## Embeddings

- sentence-transformers/all-MiniLM-L6-v2

## Vector Database

- ChromaDB

## Database

- PostgreSQL (Read Only)

## Utilities

- httpx
- slowapi (Rate Limiter)
- Loguru
- python-dotenv

---

# High-Level Architecture

Frontend

↓

Backend API

↓

FastAPI AI Service

├── Embedding Service
├── Semantic Search
├── Recommendation Engine
├── RAG Service
├── Review Summarizer
├── LLM Router
└── Location Context Builder

↓

Groq / Ollama

↓

ChromaDB + PostgreSQL

---

# Core Features

## 1. Semantic Food Discovery

Converts natural language into embeddings.

Example:

"Best butter chicken near me"

↓

Embedding

↓

Vector Search

↓

Top Matching Reviews

↓

Relevant Vendors

---

## 2. Recommendation Engine

Ranks vendors using a simple weighted score.

Score =
60% Semantic Similarity
25% Average Rating
15% Review Count

Returns:

- Ranked vendors
- Match score
- AI explanation

---

## 3. RAG Question Answering

Pipeline

User Query

↓

Location Context

↓

Semantic Search

↓

Retrieve Reviews

↓

Prompt Builder

↓

LLM

↓

Grounded Response

---

## 4. Review Summarization

Summarizes reviews for each vendor.

Example

Pros

- Authentic taste
- Affordable
- Fast service

Cons

- Limited seating
- Crowded evenings

---

## 5. LLM Router

Every request passes through a lightweight router.

Decision Flow

Simple semantic search?

↓

Yes

↓

Return results directly

No

↓

Requires reasoning?

↓

Groq

↓

Groq unavailable?

↓

Ollama

Routing Rules

- Search only → No LLM
- Recommendation explanation → Groq
- Conversational questions → Groq
- LLM failure → Ollama

This minimizes latency and API usage.

---

## 6. Location-Aware Responses

The backend should send the user's location with every AI request.

Example Request

{
    "query": "Best dosa nearby",
    "location": {
        "city": "Ahmedabad",
        "latitude": 23.0225,
        "longitude": 72.5714
    }
}

The AI service uses location to:

- Prefer nearby vendors
- Mention locality names naturally
- Filter by city
- Rank closer vendors higher
- Generate contextual responses

Example

Instead of

"XYZ Restaurant serves excellent dosa."

Return

"Since you're in Ahmedabad, XYZ Restaurant in Navrangpura is one of the highest-rated places for crispy dosa within a short distance."

If location is unavailable, the AI falls back to semantic search without geographic bias.

---

# Embedding Strategy

Embedding Model

sentence-transformers/all-MiniLM-L6-v2

Chunking Strategy

One Review = One Chunk

Each review is stored independently.

Metadata

- vendor_id
- vendor_name
- food_name
- category
- city
- locality
- average_rating
- review_count

---

# ChromaDB Collections

reviews

Stores review embeddings.

vendors

Stores vendor summaries.

(Optional)

---

# API Endpoints

GET /health

POST /embeddings/rebuild

POST /semantic-search

POST /recommend

POST /chat

POST /summarize

---

# Rate Limiting

The AI service uses SlowAPI to prevent abuse.

Suggested Limits

Health Endpoint

Unlimited

Semantic Search

60 requests/minute

Recommendations

30 requests/minute

Chat

20 requests/minute

Embedding Rebuild

Admin only

This protects Groq API usage while keeping the implementation simple.

---

# Project Structure

ai-service/

app/

    api/

    config/

    core/

    models/

    repositories/

    schemas/

    services/

    prompts/

    vector/

    utils/

tests/

scripts/

.python-version

pyproject.toml

uv.lock

README.md

---

# Request Flow

User Query

↓

Backend

↓

FastAPI

↓

Rate Limiter

↓

Location Context

↓

Embedding Generation

↓

ChromaDB Search

↓

Need LLM?

├── No
│
└── Return Search Results

↓

Yes

↓

LLM Router

↓

Groq

↓

Fallback to Ollama (if needed)

↓

AI Response

↓

Backend

↓

Frontend

---

# Error Handling

- Invalid request validation
- LLM timeout handling
- ChromaDB unavailable
- PostgreSQL unavailable
- Graceful fallback
- Standard API response format

---

# Security

- Internal API Key authentication
- Environment-based secrets
- Request validation
- Rate limiting
- CORS protection
- Structured logging

---

# Future Enhancements

- Aspect-based sentiment analysis
- Fake review detection
- Hybrid BM25 + Vector Search
- Streaming responses
- Evaluation framework
- Personalized recommendations
- Redis caching
- Background embedding sync
- Multi-LLM orchestration
- AI analytics dashboard
