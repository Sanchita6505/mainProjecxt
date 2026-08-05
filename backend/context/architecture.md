]# DilliBites Backend Architecture

## Overview

The DilliBites Backend is the core application server responsible for business logic, authentication, authorization, database management, file handling, and AI orchestration.

It follows a layered, feature-oriented architecture where each layer has a single responsibility. The backend communicates with the Python AI Service through REST APIs and never performs AI inference itself.

The backend acts as the **Backend-for-Frontend (BFF)**, providing a unified API for all clients while abstracting the complexity of AI, databases, and external integrations.

---

# Architecture Principles

- Single Responsibility Principle
- Layered Architecture
- Feature-Oriented Modules
- Thin Controllers
- Service-Oriented Business Logic
- Repository Pattern
- Stateless APIs
- RESTful Design
- AI Service Isolation
- Future Scalability

---

# High-Level Architecture

```text
                        Frontend
                            │
                            ▼
                  Node.js Backend (BFF)
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
      ▼                     ▼                     ▼
 PostgreSQL            File Storage        Python AI Service
                                                   │
                                    ┌──────────────┴──────────────┐
                                    ▼                             ▼
                                ChromaDB                    Groq / Ollama
```

---

# Layered Architecture

```text
Presentation Layer
        │
        ▼
Controller Layer
        │
        ▼
Service Layer
        │
        ▼
Repository Layer
        │
        ▼
Database / External Services
```

Each layer communicates only with the layer immediately below it.

---

# Application Layers

## 1. Routes Layer

### Responsibilities

- Register API endpoints
- Apply middleware
- Version APIs
- Group routes

Directory

```
src/routes/
```

Routes contain **no business logic**.

---

## 2. Middleware Layer

### Responsibilities

- JWT Authentication
- Authorization
- Request Logging
- Error Handling
- Validation
- File Upload
- Rate Limiting
- Security Headers

Directory

```
src/middlewares/
```

---

## 3. Controller Layer

Controllers act as request handlers.

Responsibilities

- Receive requests
- Validate request format
- Call services
- Return standardized responses

Controllers should never access the database directly.

Directory

```
src/controllers/
```

---

## 4. Service Layer

This is the heart of the application.

Responsibilities

- Business Logic
- AI orchestration
- Transaction coordination
- Data transformation
- Response preparation

Services communicate with

- Repositories
- AI Integration Layer
- Utility classes

Directory

```
src/services/
```

---

## 5. Repository Layer

Handles all PostgreSQL access.

Responsibilities

- CRUD
- Queries
- Transactions
- Pagination
- Filtering

Repositories contain **no business logic**.

Directory

```
src/repositories/
```

---

## 6. Integration Layer

Responsible for external services.

Current integrations

- AI Service
- File Storage

Future

- Email
- Notifications
- Payments

Directory

```
src/integrations/
```

Example

```
src/integrations/ai/
```

This layer hides all HTTP implementation details.

---

## 7. Database Layer

Database owned exclusively by the backend.

Stores

- Users
- Vendors
- Foods
- Reviews
- Categories
- Favorites
- Search History

Technology

- PostgreSQL
- Prisma ORM

---

# Request Lifecycle

```text
Client

↓

Express Route

↓

Authentication Middleware

↓

Validation Middleware

↓

Controller

↓

Service

↓

Need AI?

├── No
│
└── Repository

↓

Yes

↓

AI Integration

↓

Python AI Service

↓

Repository (optional)

↓

Controller

↓

Formatted Response

↓

Client
```

---

# Feature Modules

## Authentication

Responsibilities

- Register
- Login
- Refresh Token
- Logout
- Password Hashing

---

## Users

Responsibilities

- Profile
- Preferences
- Saved Locations
- Favorites

---

## Vendors

Responsibilities

- CRUD
- Images
- Categories
- Contact Information
- Operating Hours

---

## Foods

Responsibilities

- CRUD
- Categories
- Pricing
- Availability

---

## Reviews

Responsibilities

- CRUD
- Ratings
- User Reviews

After review creation

↓

Trigger AI Embedding API

---

## Categories

Responsibilities

- CRUD
- Food Categories
- Vendor Categories

---

## Search

Responsibilities

Traditional Search

↓

Keyword Search

↓

Database

AI Search

↓

Backend

↓

AI Service

↓

Semantic Results

---

## AI Integration

Responsibilities

- Build AI requests
- Attach location context
- Forward requests
- Retry
- Timeout
- Parse responses
- Hide implementation details

No business module should communicate with the AI Service directly.

---

# AI Integration Architecture

```text
Controller

↓

Recommendation Service

↓

AI Integration Service

↓

HTTP Client (Axios)

↓

Python AI Service

↓

JSON Response

↓

Recommendation Service

↓

Controller
```

---

# Location Flow

```text
Browser GPS

↓

Frontend

↓

Backend Validation

↓

Normalize Coordinates

↓

Attach Location

↓

AI Service
```

The backend owns location validation.

The AI Service only consumes validated location data.

---

# File Upload Flow

```text
Frontend

↓

Multer Middleware

↓

Validation

↓

Storage

↓

Database

↓

Response
```

---

# Folder Structure

```text
backend/

src/

├── config/
│
├── constants/
│
├── controllers/
│
├── integrations/
│   └── ai/
│
├── middlewares/
│
├── repositories/
│
├── routes/
│
├── services/
│
├── utils/
│
├── validators/
│
├── uploads/
│
├── app.js
│
└── server.js

prisma/

tests/

docs/
```

---

# Dependency Rules

Allowed dependencies

```
Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Database
```

Services may also call

```
AI Integration Layer
```

Repositories **must never**

- Call services
- Call AI
- Access controllers

Controllers **must never**

- Execute SQL
- Contain business logic

---

# Error Handling

Global Error Middleware

Responsibilities

- Capture exceptions
- Standardize responses
- Log errors
- Hide internal details

Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

# Security Architecture

Security layers

```text
Helmet

↓

CORS

↓

JWT Authentication

↓

Authorization

↓

Validation

↓

Controllers
```

Additional protections

- SQL Injection Protection (Prisma)
- Password Hashing (bcrypt)
- Environment Secrets
- Rate Limiting
- Secure HTTP Headers

---

# Logging Architecture

All requests receive a unique Request ID.

Log

- Request ID
- User ID
- Endpoint
- Method
- Response Time
- Database Time
- AI Service Time
- Status Code

Never log

- Passwords
- JWT Tokens
- API Keys
- Coordinates
- Personal Information

---

# Scalability

The architecture is intentionally modular so new modules can be added without changing existing code.

Future integrations

- Redis Cache
- WebSockets
- Event Queue
- Notification Service
- Email Service
- Payment Gateway
- Admin APIs

Existing business modules remain unchanged.

---

# Backend–AI Responsibility Split

## Backend Responsibilities

- Authentication
- Authorization
- CRUD Operations
- PostgreSQL
- Business Rules
- Validation
- File Uploads
- Location Validation
- API Gateway
- AI Orchestration
- Response Formatting

## AI Service Responsibilities

- Embedding Generation
- Semantic Search
- ChromaDB
- Recommendation Ranking
- RAG
- LLM Routing
- Review Summarization

This separation keeps the backend focused on application logic while the AI Service remains a lightweight, reusable intelligence layer.