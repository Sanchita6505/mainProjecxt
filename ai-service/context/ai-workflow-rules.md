# AI Workflow Rules

## Purpose

This document defines how every AI request should be processed inside the DilliBites AI Service.

The objective is to keep responses:

- Fast
- Grounded
- Consistent
- Explainable
- Cost Efficient

---

# Core Principles

1. Never hallucinate.
2. Prefer retrieval over generation.
3. Never call an LLM unless necessary.
4. Always use semantic search first.
5. Ground every answer in available reviews.
6. Prefer deterministic logic whenever possible.
7. Use location whenever provided.
8. Fail gracefully.

---

# Global Workflow

Incoming Request

↓

Authentication

↓

Rate Limiter

↓

Request Validation

↓

Location Context

↓

Semantic Search

↓

Decision Engine

↓

Need LLM?

↓

Response

---

# Rule 1

Always Validate Input

Reject requests with

- Empty query
- Invalid location
- Missing required fields
- Invalid coordinates

---

# Rule 2

Always Perform Semantic Search First

Never call an LLM before retrieval.

Flow

Query

↓

Embedding

↓

Vector Search

↓

Top Documents

---

# Rule 3

Use Metadata Filtering

Apply filters before ranking.

Possible Filters

- City
- Locality
- Category
- Budget
- Cuisine

---

# Rule 4

Use User Location

If location exists

Prioritize nearby vendors.

If location does not exist

Return semantic results without geographic ranking.

The AI Service never attempts to discover user location.

---

# Rule 5

Recommendation Rules

Ranking Formula

60%

Semantic Similarity

25%

Average Rating

15%

Review Count

Never let the LLM decide rankings.

LLM only explains the ranking.

---

# Rule 6

LLM Decision Rules

Use the following matrix.

Query

"Best momos nearby"

↓

Semantic Search Only

--------------------------------

Query

"Suggest a family dinner place"

↓

Semantic Search

↓

LLM Explanation

--------------------------------

Query

"Compare these restaurants"

↓

LLM

--------------------------------

Query

"Why is this place recommended?"

↓

LLM

--------------------------------

Query

"Show highest rated biryani"

↓

No LLM

--------------------------------

Default

Semantic Search First

---

# Rule 7

LLM Routing

Primary

Groq

Fallback

Ollama

Routing Order

Groq

↓

Timeout?

↓

Retry Once

↓

Failure?

↓

Ollama

↓

Return Response

If both fail

Return structured error.

---

# Rule 8

Prompt Rules

Every prompt must contain

User Query

Retrieved Context

Location Context (if available)

Instructions

Expected Format

Never send raw database records.

Never expose internal metadata.

---

# Rule 9

Context Rules

Maximum Retrieved Reviews

5

Maximum Prompt Length

Keep only the most relevant context.

Remove duplicate reviews.

---

# Rule 10

Review Summarization

Retrieve

Top Reviews

↓

LLM

↓

Pros

↓

Cons

↓

Summary

Summaries should remain factual.

No invented information.

---

# Rule 11

Response Rules

Every response should include

- Answer
- Supporting vendor(s)
- Confidence source (retrieved reviews)

Never state unsupported claims.

---

# Rule 12

Fallback Rules

No Semantic Match

↓

Return

"No relevant results found."

Do not fabricate recommendations.

---

# Rule 13

Caching Rules

Cache

- Embeddings
- Popular search queries
- Review summaries

Do not cache

- Personalized responses
- Location-specific chat answers

---

# Rule 14

Rate Limiting

Health

Unlimited

Semantic Search

60 RPM

Recommendations

30 RPM

Chat

20 RPM

Summaries

10 RPM

Embedding Rebuild

Admin Only

---

# Rule 15

Logging Rules

Log

- Endpoint
- Processing Time
- LLM Used
- Vector Search Time
- Errors

Never log

- API Keys
- User Coordinates
- Personal Data

---

# Rule 16

Error Handling

Validation Error

↓

400

Authentication

↓

401

Rate Limit

↓

429

Vector DB

↓

503

LLM Failure

↓

Fallback

Unexpected Error

↓

500

---

# Rule 17

Deterministic First

Preferred order

Exact Metadata Match

↓

Semantic Search

↓

Recommendation Formula

↓

LLM Explanation

Generation is the final step, never the first.

---

# Rule 18

Weekend MVP Constraints

Keep the implementation intentionally simple.

Avoid

- Agents
- Multi-step planning
- Tool calling
- Background workers
- Hybrid search
- Sentiment analysis
- Fake review detection
- ML ranking models

The AI Service should remain under ~20 Python modules and focus on delivering a reliable, maintainable MVP.

---

# Final AI Workflow

User Query

↓

Validate Request

↓

Apply Rate Limiter

↓

Read Location Context

↓

Generate Query Embedding

↓

Search ChromaDB

↓

Apply Metadata Filters

↓

Rank Results

↓

Need LLM?

├── No
│
└── Return Results

↓

Groq

↓

Fallback to Ollama

↓

Format Response

↓

Return JSON