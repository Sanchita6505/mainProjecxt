# Code Standards

## General

- Keep Node.js modules cohesive and domain-focused.
- Keep route handlers thin; validation, authorization checks, and orchestration belong in middleware and services.
- Prefer explicit DTOs and response models over loosely shaped objects.
- Fix data and contract issues at the boundary where they occur.
- Use structured logging with request and user context where available.

## TypeScript

- Use strict TypeScript.
- Avoid `any`; prefer DTOs, Prisma types, enums, and narrow interfaces.
- Validate environment variables at startup.
- Validate all external input with the project-standard validation layer before it reaches business logic.
- Use explicit return types for public service methods and route handlers.

## Node.js API

- Organize by domain folder: auth, users, vendors, reviews, ratings, search, ai, admin, uploads, common, config.
- Use middleware for authentication, request context, rate limiting, and request logging.
- Use explicit authorization helpers for customer, vendor, and admin access checks.
- Use centralized error handling for consistent API responses.
- Keep services dependency-injected through constructors, factories, or explicit function parameters so they remain testable.
- Do not place database logic directly in route handlers.

## Styling

- Backend code has no UI styling responsibilities.
- Any admin-facing presentation concerns belong in the frontend.
- API response fields should be named for frontend clarity and documented in Swagger.

## API Routes

- Use RESTful route naming and version APIs if breaking changes are introduced.
- Validate and parse request input before business logic runs.
- Enforce auth and role checks before mutations.
- Return consistent error shapes and status codes.
- Document endpoints, DTOs, auth requirements, and examples in Swagger.
- Use pagination for list endpoints and never return unbounded collections.

## Data and Storage

- PostgreSQL is the source of truth for relational data.
- Use Prisma migrations for schema changes.
- Wrap multi-entity writes in transactions.
- Store large image binaries in object storage, not PostgreSQL.
- Store ChromaDB vectors in the AI service; backend stores review IDs and sync metadata.
- Use Redis for cache and queue coordination, not durable business records.

## File Organization

- `src/auth/` - JWT, auth middleware, roles, token handling, and auth DTOs.
- `src/users/` - User profile, preferences, favorites, and history.
- `src/vendors/` - Vendor profile, claims, menus, images, hours, categories, and analytics.
- `src/reviews/` - Review lifecycle, moderation, photos, and AI sync publishing.
- `src/ratings/` - Rating submission, aggregates, and rating queries.
- `src/search/` - Structured search services and query DTOs.
- `src/ai/` - AI service client, request/response DTOs, queue producers, and fallback handling.
- `src/admin/` - Administrative workflows.
- `src/uploads/` - Upload signing and image metadata.
- `src/common/` - Shared middleware, validators, errors, response helpers, and utilities.
- `src/config/` - App configuration and environment validation.
- `prisma/` - Schema, migrations, generated client configuration, and seeds.
