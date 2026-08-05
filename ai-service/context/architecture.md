# DilliBites AI Service Architecture

## Overview

The DilliBites AI Service is a standalone Python FastAPI microservice responsible for all AI-powered capabilities of the application.

It follows a layered architecture where each layer has a single responsibility.

The service communicates only with the Backend API and is never exposed directly to end users.

---

# Architecture Principles

- Single Responsibility
- Stateless APIs
- Modular Design
- Simple over Complex
- Zero-Cost Friendly
- Easy to Extend
- Vendor Independent

---

# High-Level Architecture

                    Frontend
                        │
                        │
                        ▼
                 Backend API
                        │
                        │
                        ▼
            Python FastAPI AI Service
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   PostgreSQL        ChromaDB       Groq / Ollama

---

# Internal Layers

## 1. API Layer

Responsibilities

- Receive requests
- Validate payload
- Authenticate
- Apply Rate Limiter
- Return standardized responses

Directory

app/api/

---

## 2. Service Layer

Contains all business logic.

Modules

- Semantic Search
- Recommendation
- RAG
- Review Summary
- Embeddings
- LLM Router
- Location Context

Directory

app/services/

---

## 3. Vector Layer

Responsible for ChromaDB.

Responsibilities

- Collection Management
- Upsert
- Search
- Delete

Directory

app/vector/

---

## 4. Data Layer

Responsible for PostgreSQL access.

Responsibilities

- Fetch Reviews
- Fetch Vendors
- Fetch Food Metadata

This service is read-only.

Directory

app/repositories/

---

## 5. Prompt Layer

Stores all LLM prompts.

Examples

recommendation.txt

chat.txt

summary.txt

Directory

app/prompts/

---

## Request Lifecycle

User

↓

Frontend

↓

Backend

↓

AI Service

↓

Authentication

↓

Rate Limiter

↓

Payload Validation

↓

Location Context

↓

Embedding Generation

↓

Vector Search

↓

Need LLM?

├── No
│
└── Return Response

↓

Yes

↓

LLM Router

↓

Groq

↓

Fallback

↓

Ollama

↓

Response Formatter

↓

Backend

↓

Frontend

---

# Component Responsibilities

## Embedding Service

Input

Review Text

Output

Embedding Vector

Responsibilities

- Generate embeddings
- Store embeddings
- Similarity search

---

## Semantic Search

Input

Natural language query

Output

Relevant review documents

Responsibilities

- Query embedding
- Chroma search
- Metadata filtering

---

## Recommendation Engine

Input

Retrieved vendors

Output

Ranked vendor list

Current Formula

60%

Semantic Similarity

25%

Average Rating

15%

Review Count

---

## Review Summarizer

Input

Vendor Reviews

Output

Pros

Cons

Short Summary

Summary is generated on demand.

---

## RAG Service

Responsibilities

Retrieve

↓

Context Builder

↓

Prompt Builder

↓

LLM

↓

Grounded Response

---

## LLM Router

Purpose

Avoid unnecessary LLM usage.

Decision Matrix

Search Only

→ No LLM

Recommendation Explanation

→ Groq

Conversational Question

→ Groq

Groq Failure

→ Ollama

---

## Location Context

Receives

City

Latitude

Longitude

Responsibilities

- Geographic filtering
- Distance prioritization
- Context injection into prompts

The AI Service never determines user location itself.

---

# Folder Structure

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

# API Flow

GET /health

↓

Health Service

-----------------------

POST /semantic-search

↓

Semantic Search

↓

ChromaDB

↓

Response

-----------------------

POST /recommend

↓

Semantic Search

↓

Ranking

↓

Response

-----------------------

POST /chat

↓

Semantic Search

↓

RAG

↓

LLM Router

↓

Groq/Ollama

↓

Response

-----------------------

POST /summarize

↓

Retrieve Reviews

↓

LLM

↓

Summary

---

# Dependencies

FastAPI

↓

Sentence Transformers

↓

ChromaDB

↓

Groq SDK

↓

Ollama

↓

PostgreSQL

---

# Error Strategy

Validation Error

↓

400

LLM Timeout

↓

Fallback

Database Error

↓

503

Vector DB Error

↓

503

Unexpected Error

↓

500

---

# Security

- Internal API Key
- Environment Variables
- Request Validation
- Rate Limiting
- Structured Logging
- HTTPS (Production)

---

# Scalability

Future modules can be added without modifying existing services.

Possible additions

- Sentiment Analysis
- Fake Review Detection
- Background Workers
- Redis Cache
- Hybrid Search
- AI Evaluation
- Multi-Agent Workflows

Current architecture is intentionally lightweight while remaining production-oriented.