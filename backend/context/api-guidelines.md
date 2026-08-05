# API Guidelines

## Overview

This document defines the API design standards for the DilliBites Node.js Backend.

The objective is to ensure that every API is:

- Consistent
- Predictable
- RESTful
- Secure
- Easy to maintain
- Frontend-friendly

All developers should follow these guidelines when creating or modifying endpoints.

---

# API Design Principles

1. REST-first architecture.
2. Consistent request and response formats.
3. Resource-oriented endpoints.
4. Stateless communication.
5. Standard HTTP status codes.
6. API versioning from day one.
7. Validate every request.
8. Never expose internal implementation details.
9. Keep controllers thin.
10. Business logic belongs in services.

---

# Base URL

```
/api/v1
```

Example

```
/api/v1/vendors
```

Future versions

```
/api/v2
```

---

# API Naming Convention

Use plural resource names.

✅

```
/vendors
/foods
/reviews
/users
/categories
```

Avoid

```
/vendor
/getVendor
/createVendor
```

---

# HTTP Methods

## GET

Retrieve data.

Example

```
GET /vendors
```

---

## POST

Create resources.

Example

```
POST /reviews
```

---

## PUT

Replace an existing resource.

Example

```
PUT /vendors/:vendorId
```

---

## PATCH

Partially update.

Example

```
PATCH /users/profile
```

---

## DELETE

Delete resource.

Example

```
DELETE /reviews/:reviewId
```

---

# URL Structure

Preferred

```
/vendors

/vendors/:vendorId

/vendors/:vendorId/reviews

/foods/:foodId

/users/profile
```

Avoid

```
/getVendor

/addVendor

/vendorDetails

/updateReview
```

---

# Resource Relationships

Nested resources should represent ownership.

Examples

```
GET /vendors/:vendorId/reviews

GET /vendors/:vendorId/foods

GET /users/:userId/favorites
```

Avoid deeply nested URLs.

❌

```
/vendors/1/foods/5/reviews/3/comments
```

---

# Query Parameters

Use query parameters for

- Search
- Filtering
- Sorting
- Pagination

Example

```
GET /vendors

?page=1

&limit=20

&city=Ahmedabad

&category=Street Food

&sort=rating

&order=desc
```

Never use query parameters for required resources.

---

# Request Body

Use JSON.

Example

```json
{
    "vendorId": 15,
    "rating": 5,
    "review": "Amazing food."
}
```

---

# Standard Response Format

Every successful response

```json
{
    "success": true,
    "message": "Operation completed successfully.",
    "data": {}
}
```

---

Every error response

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": []
}
```

Never return raw database objects.

---

# Pagination Format

Example

```json
{
    "success": true,
    "data": {
        "items": [],
        "pagination": {
            "page": 1,
            "limit": 20,
            "totalItems": 350,
            "totalPages": 18,
            "hasNext": true,
            "hasPrevious": false
        }
    }
}
```

---

# Sorting

Supported

```
sort=rating

sort=createdAt

sort=name

sort=distance
```

Order

```
order=asc

order=desc
```

---

# Filtering

Examples

```
city=Ahmedabad

category=Street Food

minRating=4

maxPrice=300

openNow=true
```

Filters should always be optional.

---

# Searching

Traditional search

```
GET /search?q=momos
```

Semantic search

```
POST /ai/search
```

The backend decides whether to invoke the AI Service.

---

# Authentication

Protected endpoints require

```
Authorization

Bearer <JWT>
```

Never place tokens in

- Query parameters
- Request body

---

# Authorization

Example roles

```
ADMIN

VENDOR

CUSTOMER
```

Controllers should never check permissions manually.

Use authorization middleware.

---

# Validation

Every request must be validated.

Use Zod schemas.

Validate

- Params
- Query
- Body
- Headers

Invalid requests return

```
400 Bad Request
```

---

# HTTP Status Codes

## Success

| Code | Meaning |
|------|----------|
|200|OK|
|201|Created|
|204|No Content|

---

## Client Errors

| Code | Meaning |
|------|----------|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation Error|
|429|Too Many Requests|

---

## Server Errors

| Code | Meaning |
|------|----------|
|500|Internal Server Error|
|502|Bad Gateway|
|503|Service Unavailable|
|504|Gateway Timeout|

---

# Error Messages

Good

```
Vendor not found.

Review already exists.

Authentication failed.
```

Avoid

```
Database Exception

SQL Error

Null Pointer

Unexpected Exception
```

Never expose stack traces.

---

# AI Endpoints

The frontend should **never** call the Python AI Service.

Instead

```
Frontend

↓

Node Backend

↓

AI Integration

↓

Python AI Service
```

Public AI routes

```
POST /api/v1/ai/search

POST /api/v1/ai/recommend

POST /api/v1/ai/chat

POST /api/v1/ai/review-summary
```

The backend translates these requests into the corresponding internal AI service endpoints.

---

# File Upload APIs

Multipart form data.

Example

```
POST /vendors/:vendorId/image
```

Validation

- File type
- File size
- MIME type

---

# Idempotency

Safe operations

```
GET

PUT

DELETE
```

POST should not be assumed idempotent.

Future payment or webhook APIs should support idempotency keys.

---

# Rate Limiting

Suggested limits

Authentication

```
10 requests/minute
```

Search

```
60 requests/minute
```

AI Chat

```
20 requests/minute
```

Review Creation

```
30 requests/minute
```

---

# API Versioning

Always prefix routes

```
/api/v1
```

Never modify existing response contracts in the same version.

Breaking changes require

```
/api/v2
```

---

# Logging

Every request should log

- Request ID
- Endpoint
- Method
- User ID
- Status Code
- Duration

Never log

- Passwords
- JWT Tokens
- API Keys
- Coordinates
- Raw review text

---

# Controller Rules

Controllers should only

- Receive requests
- Validate input
- Call services
- Return responses

Controllers must never

- Execute SQL
- Call Prisma directly
- Call AI directly
- Perform business logic

---

# Service Rules

Services

- Contain business logic
- Coordinate repositories
- Call AI Integration Service
- Manage transactions

Services should not know HTTP implementation details.

---

# Repository Rules

Repositories

- Only interact with Prisma
- Never call services
- Never call AI
- Never format responses

Repositories return domain objects only.

---

# AI Integration Rules

Business modules should never communicate directly with Axios.

Only

```
AIIntegrationService
```

may communicate with the Python AI Service.

---

# Naming Conventions

Routes

```
kebab-case
```

Examples

```
review-summary

favorite-vendors

search-history
```

JSON properties

```
camelCase
```

Examples

```json
{
    "vendorId": 10,
    "reviewCount": 150,
    "averageRating": 4.6
}
```

Database columns

```
snake_case
```

Examples

```
vendor_id

created_at

review_text
```

---

# Weekend MVP API Scope

Authentication

```
POST /auth/register

POST /auth/login
```

Users

```
GET /users/profile

PATCH /users/profile
```

Vendors

```
GET /vendors

GET /vendors/:vendorId

POST /vendors

PUT /vendors/:vendorId

DELETE /vendors/:vendorId
```

Foods

```
GET /foods

GET /foods/:foodId

POST /foods

PUT /foods/:foodId

DELETE /foods/:foodId
```

Reviews

```
POST /reviews

GET /reviews/:reviewId

PUT /reviews/:reviewId

DELETE /reviews/:reviewId
```

Categories

```
GET /categories
```

AI

```
POST /ai/search

POST /ai/recommend

POST /ai/chat

POST /ai/review-summary
```

---

# Future API Extensions

- Notifications
- Favorites
- Search History
- Analytics
- Admin APIs
- Vendor Dashboard
- Image Gallery
- Social Login
- Saved Places
- User Preferences
- Recommendation Feedback
- Public API Keys

---

# API Checklist

Before creating any endpoint, verify:

- [ ] Uses `/api/v1` prefix.
- [ ] Uses the correct HTTP method.
- [ ] Uses plural resource names.
- [ ] Validates params, query, and body with Zod.
- [ ] Requires authentication where appropriate.
- [ ] Applies authorization middleware where required.
- [ ] Returns the standard response format.
- [ ] Uses appropriate HTTP status codes.
- [ ] Keeps controllers thin.
- [ ] Delegates business logic to services.
- [ ] Uses repositories for database access.
- [ ] Calls the AI Integration Service instead of the AI Service directly.
- [ ] Logs request metadata without exposing sensitive information.
- [ ] Includes Swagger/OpenAPI documentation before merging.

---

# Guiding Principle

> **The API is a contract with the frontend.**
>
> Controllers expose a stable, predictable interface, services implement business rules, repositories manage persistence, and the AI Integration Service encapsulates all communication with the Python AI Service. Every endpoint should be consistent, secure, and easy to evolve without breaking existing clients.