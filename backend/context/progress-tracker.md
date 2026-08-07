# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

MVP Backend — Phase 1 Complete

## Current Goal

Run `npm install`, configure `.env`, run `prisma migrate dev`, then `npm run dev`.

## Completed

- [x] package.json with all dependencies
- [x] .env.example template
- [x] Prisma schema (User, Vendor, Food, Review, Category, Favorite, VendorCategory)
- [x] prisma/seed.js with 10 default categories
- [x] src/config/env.js — startup env validation (Zod)
- [x] src/config/logger.js — Winston logger
- [x] src/config/prisma.js — Prisma singleton
- [x] src/config/aiClient.js — shared Axios client for AI service
- [x] src/common/response.js — standardized response helpers
- [x] src/common/errors.js — AppError hierarchy
- [x] src/common/errorMiddleware.js — global error handler
- [x] src/common/validate.js — Zod validation middleware factory
- [x] src/common/pagination.js — pagination helpers
- [x] src/middlewares/authenticate.js — JWT auth middleware
- [x] src/middlewares/authorize.js — role-based authorization middleware
- [x] src/middlewares/requestLogger.js — request ID + structured logging
- [x] src/middlewares/upload.js — Multer file upload middleware
- [x] src/integrations/ai/aiService.js — AI integration layer (search, recommend, chat, summary, embed)
- [x] Validators: auth, vendor, food, review, ai
- [x] Repositories: user, vendor, food, review, category, favorite
- [x] Services: auth, user, vendor, food, review, category, favorite, search, ai
- [x] Controllers: auth, user, vendor, food, review, category, search, ai
- [x] Routes: auth, user, vendor, food, review, category, search, ai
- [x] src/app.js — Express app with all middleware and routes
- [x] src/server.js — server entry with graceful shutdown

## In Progress

- [ ] npm install
- [ ] .env setup
- [ ] prisma migrate dev

## Next Up

- [ ] Docker Compose integration
- [ ] File upload endpoints (vendor/food images)
- [ ] Vendor reviews sub-route (GET /vendors/:vendorId/reviews)
- [ ] Redis caching layer
- [ ] Admin routes

## Open Questions

- File storage: local disk (current) vs S3?
- Redis: add now or defer?

## Architecture Decisions

- JavaScript (not TypeScript) for MVP speed
- Soft deletes on User, Vendor, Food, Review
- Embedding failures are fire-and-forget (do not roll back review creation)
- AI fallback: recommendations fall back to DB sort by avgRating
- Single Axios instance for AI service (aiClient.js)

## Session Notes

- Full layered architecture: Routes → Controllers → Services → Repositories
- AI integration isolated in src/integrations/ai/aiService.js
- All endpoints under /api/v1
- Rate limiting applied at route level (auth: 10/min, search: 60/min, chat: 20/min, reviews: 30/min)
