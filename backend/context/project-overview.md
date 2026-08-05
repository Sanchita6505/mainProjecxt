# DilliBites Backend

## Overview

The DilliBites Backend is the primary application server responsible for business logic, data management, authentication, authorization, and communication with the AI Service. It acts as the single entry point for all client applications and orchestrates interactions between the database, storage, and AI microservice.

Unlike the AI Service, the backend does **not perform any AI inference**. Instead, it validates requests, enriches them with business context (such as user location and permissions), persists data, and invokes the AI Service whenever intelligent processing is required.

The backend is intentionally designed as a **Backend-for-Frontend (BFF)**, allowing web, mobile, or future clients to communicate through a consistent API while keeping AI implementation details hidden.

---

# Goals

- Manage all application data
- Provide secure REST APIs
- Handle authentication and authorization
- Manage vendors, foods, reviews, and users
- Validate and enrich client requests
- Coordinate AI-powered features
- Maintain a clean separation between business logic and AI logic
- Provide a scalable foundation for future mobile and web applications

---

# Responsibilities

## Business Logic

- Vendor Management
- Food Management
- Category Management
- User Management
- Review Management
- Rating Management
- Bookmark/Favorite Management
- Search History
- Location Management

---

## API Gateway

The backend acts as the gateway between the frontend and the AI Service.

Responsibilities include:

- Validate requests
- Authenticate users
- Apply authorization rules
- Forward AI requests
- Handle retries
- Format AI responses
- Return consistent API responses

The frontend never communicates directly with the AI Service.

---

## Database Management

The backend owns PostgreSQL and is responsible for:

- CRUD operations
- Transactions
- Referential integrity
- Soft deletes
- Data validation
- Pagination
- Filtering
- Sorting

The AI Service only reads application data when required.

---

## Location Management

The backend is responsible for validating user location before sending it to the AI Service.

Possible sources:

- Browser Geolocation
- Mobile GPS
- Selected City
- Saved User Location

Responsibilities

- Validate coordinates
- Validate city
- Normalize location format
- Attach location context to AI requests

The AI Service never determines the user's location.

---

## File Management

The backend handles

- Food images
- Vendor images
- Profile pictures

Responsibilities

- Upload
- Delete
- Validation
- Compression (future)

---

## AI Integration

The backend communicates with the AI Service for

- Semantic Search
- Food Recommendations
- RAG Chat
- Review Summaries
- Embedding Imports

The backend remains responsible for

- Request validation
- User context
- Location context
- Authentication
- Error handling
- Response formatting

---

# Out of Scope

The backend intentionally does not perform

- Embedding generation
- Vector search
- LLM inference
- Recommendation ranking
- Prompt engineering
- ChromaDB operations

These responsibilities belong exclusively to the AI Service.

---

# High-Level Architecture

                    Frontend
                        │
                        ▼
               Node.js Backend
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
 PostgreSQL         File Storage      AI Service
                                          │
                                 ┌────────┴────────┐
                                 ▼                 ▼
                             ChromaDB       Groq / Ollama

---

# Tech Stack

## Runtime

- Node.js (LTS)

## Framework

- Express.js

## Language

- JavaScript (or TypeScript in future)

## Database

- PostgreSQL

## ORM

- Prisma ORM

## Validation

- Zod

## Authentication

- JWT

## Password Hashing

- bcrypt

## File Upload

- Multer

## HTTP Client

- Axios

## Logging

- Winston

## Environment

- dotenv

---

# Project Structure

backend/

src/

├── config/

├── routes/

├── controllers/

├── services/

├── repositories/

├── middlewares/

├── validators/

├── models/

├── utils/

├── constants/

├── integrations/

│   └── ai/

├── jobs/

├── uploads/

└── app.js

tests/

prisma/

docs/

---

# Core Modules

## Authentication

Responsibilities

- Login
- Registration
- JWT
- Refresh Tokens
- Password Reset (future)

---

## User Module

Responsibilities

- Profile
- Saved Locations
- Favorites
- Preferences

---

## Vendor Module

Responsibilities

- CRUD
- Categories
- Images
- Operating Hours
- Contact Information

---

## Food Module

Responsibilities

- CRUD
- Menu Items
- Categories
- Pricing

---

## Review Module

Responsibilities

- Create Reviews
- Update Reviews
- Delete Reviews
- Ratings
- Review History

Every review creation automatically triggers an AI embedding request.

---

## Search Module

Provides

- Traditional keyword search
- Filter search

AI-powered semantic search is delegated to the AI Service.

---

## AI Integration Module

Responsible for communicating with the AI Service.

Endpoints include

- Semantic Search
- Recommendations
- Chat
- Review Summary
- Bulk Import

The module should hide all HTTP communication details from the rest of the application.

---

# API Categories

Authentication

/api/v1/auth/*

Users

/api/v1/users/*

Vendors

/api/v1/vendors/*

Foods

/api/v1/foods/*

Reviews

/api/v1/reviews/*

Categories

/api/v1/categories/*

Favorites

/api/v1/favorites/*

Search

/api/v1/search/*

AI

/api/v1/ai/*

---

# Request Flow

User

↓

Frontend

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

Yes

↓

Attach User Context

↓

Attach Location

↓

Call AI Service

↓

Receive Response

↓

Format Response

↓

Frontend

---

# Response Format

Every endpoint should return a consistent response format.

Success

{
    "success": true,
    "message": "...",
    "data": {}
}

Failure

{
    "success": false,
    "message": "...",
    "errors": []
}

---

# Security

- JWT Authentication
- Role-Based Authorization
- Request Validation
- SQL Injection Protection
- Helmet
- CORS
- Rate Limiting
- Environment-based Secrets
- Secure Password Hashing

---

# Logging

Log

- Requests
- Responses
- AI Calls
- Errors
- Processing Time

Never log

- Passwords
- JWT Tokens
- API Keys
- User Coordinates
- Personal Information

---

# Error Handling

- Validation Errors
- Authentication Errors
- Authorization Errors
- Database Errors
- AI Service Errors
- Timeout Errors
- External Service Failures

All errors should follow a standardized response format.

---

# Scalability

The backend is organized using feature-based modules with clear separation between controllers, services, repositories, and integrations.

As the application grows, additional modules such as notifications, admin dashboards, analytics, payment gateways, or social features can be added without affecting the existing architecture.

---

# Future Enhancements

- Admin Dashboard
- Notification Service
- Redis Caching
- WebSockets
- User Activity Tracking
- Search Analytics
- Recommendation Feedback Loop
- Social Login
- Image Optimization
- Event Queue
- Background Jobs
- API Versioning

---

# Weekend MVP Scope

The initial implementation focuses only on the features required to support the AI-powered food discovery experience.

Included

- Authentication
- Vendor CRUD
- Food CRUD
- Review CRUD
- Category Management
- AI Service Integration
- Location Validation
- Search APIs
- File Upload
- Standardized Responses
- PostgreSQL Integration

Deferred

- Notifications
- Background Jobs
- Redis
- Admin Dashboard
- Analytics
- Email Service
- Payment Integration
- WebSockets
- Event Bus

The backend is intentionally lightweight while remaining modular and production-ready, serving as the orchestration layer between the client applications and the Python AI Service.