# DilliBites AI Service

## Overview

The DilliBites AI service is an independent Python FastAPI microservice that powers semantic food discovery, review embeddings, RAG answers, recommendation ranking, sentiment analysis, review summarization, fake-review detection, and LLM routing. It consumes review and user-context data from the Node.js backend, stores vectors in ChromaDB, uses Groq as the primary LLM provider, and falls back to Ollama when required.

## Goals

1. Convert reviews and relevant vendor text into searchable embeddings with `BAAI/bge-small-en-v1.5` and store them in ChromaDB.
2. Answer natural language food discovery questions using retrieval-augmented generation over trusted platform data.
3. Produce ranked vendor recommendations using ratings, review sentiment, popularity, recency, distance, preferences, price, open-now state, and food category signals.
4. Provide reusable APIs for sentiment analysis, review summaries, fake-review detection, semantic search, and AI chat.

## Core User Flow

1. Backend saves a review or vendor-content change in PostgreSQL.
2. Backend sends an indexing event or API request to the AI service.
3. AI service generates embeddings and stores or updates vectors in ChromaDB.
4. User asks a natural language question through the frontend and backend.
5. AI service embeds the question, retrieves similar reviews and vendor context from ChromaDB, and builds a grounded prompt.
6. Groq generates the primary answer; Ollama is used as fallback when configured and needed.
7. AI service returns ranked vendors, explanation snippets, source references, and confidence metadata to the backend.

## Features

### Embeddings and Vector Search

- Generate embeddings for reviews and vendor text.
- Use `BAAI/bge-small-en-v1.5` as the zero-cost default embedding model; allow `BAAI/bge-base-en-v1.5` as a higher-resource configuration option.
- Store review embeddings in ChromaDB with `vendor_id`, `food_item`, `location`, `category`, `rating`, `review_date`, `user_id`, `review_id`, and chunk metadata.
- Keep short street food reviews as a single chunk when possible.
- Split longer reviews with recursive character splitting at semantic boundaries using 350-450 tokens, approximately 700-900 characters, with 60-80 token overlap, approximately 120-160 characters.
- Run semantic search for dish, cuisine, vendor, area, and intent-like queries.
- Support embedding sync, update, and delete workflows.

### RAG and AI Chat

- Retrieve relevant reviews and vendor context for user questions.
- Build prompts for food recommendations, vendor comparisons, best dishes, and nearby options.
- Return ranked vendor recommendations with concise reasoning.
- Maintain chat API contracts for backend consumption.

### Recommendations

- Combine semantic relevance with overall rating, review count, sentiment, popularity, recent reviews, distance, cuisine preference, price, open-now status, food category, and personalization signals.
- Support trending and personalized recommendation modes as MVP-compatible interfaces.

### Review Intelligence

- Summarize large review sets into short vendor insights.
- Extract sentiment by dimensions such as taste, hygiene, service, and value.
- Detect likely spam, duplicate, copy-paste, or AI-generated reviews for moderation workflows.

### LLM Routing

- Use Groq as the primary LLM inference provider.
- Use Ollama as local fallback when configured.
- Keep provider-specific code behind routing interfaces.

## Scope

### In Scope

- Python FastAPI service using LangChain, Sentence Transformers, ChromaDB, Groq API, Ollama, Pydantic, SQLAlchemy, Alembic, and Docker Compose.
- AI APIs for embedding sync, semantic search, recommendations, RAG chat, sentiment, review summaries, moderation signals, and health checks.
- Structured request/response schemas for backend integration.
- Tests for prompt construction, retrieval, ranking, schema validation, and provider fallback behavior.

### Out of Scope

- User authentication UI, frontend rendering, and dashboard implementation.
- Source-of-truth relational CRUD for users, vendors, reviews, and ratings.
- Direct public browser access to AI endpoints.
- Payment, delivery, loyalty, social videos, OCR, voice search, and multilingual support in MVP v1.0.

## Success Criteria

1. A review indexing request creates or updates the expected ChromaDB vector record.
2. A natural language recommendation request retrieves relevant review context and returns ranked vendors.
3. Sentiment, summary, and moderation APIs return stable typed responses for backend workflows.
4. Groq primary routing and Ollama fallback behavior are observable and testable.
5. Tests cover retrieval, ranking, prompt inputs, provider routing, and failure handling.
