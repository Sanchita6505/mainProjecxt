# AI Integration Rules

## Overview

This document defines how the Node.js Backend communicates with the Python AI Service.

The backend **never performs AI operations directly**. Instead, it acts as the orchestration layer that validates requests, enriches them with business context, invokes the AI Service, and formats the final response.

The objective is to keep the backend and AI service loosely coupled so that either service can evolve independently.

---

# Core Principles

1. The backend owns all business logic.
2. The AI Service owns all AI logic.
3. The frontend never communicates directly with the AI Service.
4. Every AI request must originate from the backend.
5. Every AI request must be validated before forwarding.
6. The backend enriches AI requests with business context.
7. The AI Service remains stateless.
8. Fail gracefully when the AI Service is unavailable.

---

# Responsibility Matrix

| Backend | AI Service |
|----------|------------|
| Authentication | Embeddings |
| Authorization | Semantic Search |
| CRUD Operations | Recommendation Ranking |
| PostgreSQL | ChromaDB |
| Validation | RAG |
| File Uploads | Review Summarization |
| User Context | LLM Routing |
| Location Validation | Prompt Building |
| Response Formatting | LLM Communication |

---

# Communication Flow

```text
Frontend

↓

Backend

↓

Validation

↓

Business Logic

↓

Need AI?

├── No
│
└── Return Response

↓

Build AI Request

↓

Python AI Service

↓

Receive AI Response

↓

Merge Business Data

↓

Return Client Response
```

---

# AI Communication Rules

## Rule 1

The backend is the **only** service allowed to communicate with the AI Service.

Never expose AI endpoints publicly.

---

## Rule 2

Every AI request must contain a valid authenticated user context (when applicable).

Example

```json
{
  "userId": 15,
  "query": "Best biryani nearby"
}
```

---

## Rule 3

Always validate requests before calling AI.

Validate

- Required fields
- Query length
- Coordinates
- Vendor IDs
- Review IDs
- Category IDs

Invalid requests must never reach the AI Service.

---

## Rule 4

Normalize location before forwarding.

Input

```json
{
  "latitude": 23.0225,
  "longitude": 72.5714
}
```

Backend validates

↓

AI receives

```json
{
  "location": {
    "city": "Ahmedabad",
    "latitude": 23.0225,
    "longitude": 72.5714
  }
}
```

The AI Service should never determine user location.

---

# Request Enrichment

Before sending a request, the backend may attach:

- User ID
- Preferred City
- GPS Coordinates
- Filters
- Language
- Pagination
- Business Constraints

Example

```json
{
  "query": "Best dosa nearby",
  "location": {
    "city": "Ahmedabad",
    "latitude": 23.0225,
    "longitude": 72.5714
  },
  "filters": {
    "category": "South Indian",
    "budget": 300
  }
}
```

---

# AI Endpoint Mapping

| Backend Feature | AI Endpoint |
|-----------------|------------|
| Semantic Search | POST /api/v1/semantic-search/query |
| Recommendations | POST /api/v1/recommendations/rank |
| Chat | POST /api/v1/rag/chat |
| Review Summary | POST /api/v1/summaries/review |
| CSV Import | POST /api/v1/embeddings/bulk-import |
| Review Import | POST /api/v1/embeddings/reviews |

Business modules must call the AI Integration Service, **not** the AI endpoints directly.

---

# AI Integration Layer

Architecture

```text
Controller

↓

Service

↓

AI Integration Service

↓

Axios Client

↓

Python AI Service
```

Only the AI Integration Service should know

- AI URLs
- Headers
- API Keys
- Timeout values
- Retry policy

---

# AI Client Rules

Use a single shared Axios instance.

Configuration

- Base URL from environment
- Default timeout
- Default headers
- Request interceptor
- Response interceptor

Never create Axios instances inside controllers or services.

---

# Timeout Rules

Recommended timeout

| Endpoint | Timeout |
|----------|---------|
| Semantic Search | 5 seconds |
| Recommendations | 8 seconds |
| Chat | 15 seconds |
| Summaries | 20 seconds |
| Embedding Import | 60 seconds |

Requests exceeding timeout should be cancelled.

---

# Retry Rules

Retry only when

- Network Error
- Timeout
- HTTP 503

Never retry

- HTTP 400
- HTTP 401
- HTTP 403
- HTTP 404
- HTTP 422

Maximum retries

2

Use exponential backoff.

---

# Circuit Breaker

If repeated failures occur

↓

Stop sending requests temporarily

↓

Return graceful fallback

↓

Retry after cooldown

Future implementation may use

- Opossum
- Cockatiel

Weekend MVP may skip circuit breaker implementation.

---

# Response Validation

Always validate AI responses.

Required

- HTTP Status
- JSON Structure
- Required fields

Never trust external responses blindly.

---

# Error Handling

If AI Service returns

400

↓

Return Validation Error

--------------------------------

401

↓

Log Security Issue

--------------------------------

404

↓

Return Resource Not Found

--------------------------------

429

↓

Return Rate Limit Response

--------------------------------

500

↓

Return Generic AI Error

--------------------------------

503

↓

Return Service Unavailable

---

# Fallback Rules

If Semantic Search fails

↓

Return empty search results.

If Recommendations fail

↓

Fallback to database sorting

Sort by

- Average Rating
- Review Count

If Chat fails

↓

Return

"AI assistant is currently unavailable. Please try again later."

Never fabricate AI-generated content.

---

# Bulk Import Rules

CSV Upload

↓

Backend Validation

↓

Forward CSV

↓

AI Service

↓

Insert Reviews

↓

Generate Embeddings

↓

Return Summary

The backend should not generate embeddings.

---

# Review Creation Flow

```text
Create Review

↓

Save Review

↓

Commit Transaction

↓

Call AI Service

↓

Generate Embedding

↓

Return Success
```

Embedding failures must not roll back review creation.

Log failures for later investigation.

---

# Request Logging

Log

- Request ID
- Endpoint
- Processing Time
- AI Endpoint
- Response Status
- Retry Count

Never log

- API Keys
- JWT Tokens
- User Coordinates
- Raw Review Text
- Personal Data

---

# Security Rules

- Store AI API URL in environment variables.
- Never expose internal AI URLs to clients.
- Use internal authentication (API Key or service token) between Backend and AI Service.
- Sanitize all user input before forwarding.
- Apply backend rate limiting before AI requests.

---

# Performance Rules

- Reuse a single Axios client.
- Keep AI requests asynchronous.
- Avoid duplicate AI calls in the same request.
- Request only the data required by the AI endpoint.
- Do not send unnecessary database fields.

---

# Caching Strategy

Future enhancement

Cache

- Recommendation responses
- Review summaries
- Frequently searched queries

Do not cache

- Personalized chat
- User-specific recommendations
- Requests containing live location

Weekend MVP can omit caching.

---

# Backend Development Rules

Controllers

- Never call AI directly.

Repositories

- Never call AI.

Services

- Call AI only through the AI Integration Service.

The AI Integration Service

- Owns all HTTP communication.
- Owns retry logic.
- Owns timeout configuration.
- Owns request/response mapping.

This ensures a single integration point and makes future changes (e.g., switching to gRPC, adding service discovery, or supporting multiple AI services) possible without affecting the rest of the backend.

---

# Future Enhancements

- Redis response caching
- Circuit breaker
- Service discovery
- Request batching
- Streaming AI responses
- Background AI jobs
- Queue-based embedding generation
- Multiple AI service providers
- API version negotiation

---

# Final Integration Workflow

```text
Client

↓

Node.js Backend

↓

Authentication

↓

Validation

↓

Business Logic

↓

Need AI?

├── No
│
└── PostgreSQL

↓

Build AI Request

↓

AI Integration Service

↓

Axios Client

↓

Python AI Service

↓

Validate Response

↓

Merge Business Context

↓

Standardize Response

↓

Client
```

## Guiding Principle

> **The backend owns the application, the AI Service owns the intelligence.**  
> The backend decides **when** AI is needed and provides validated business context. The AI Service decides **how** to process that context and returns deterministic, grounded AI results.