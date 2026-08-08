# AI Workflow Rules

## Approach

Build the AI service incrementally from these context files. The service owns AI computation and vector retrieval, while the backend owns relational truth, authorization, and public API exposure. Favor testable, observable pipelines over opaque chains.

## Scoping Rules

- Work on one AI capability at a time: embeddings, vector search, RAG chat, recommendations, sentiment, summaries, or moderation.
- Start with typed contracts and deterministic tests before adding provider-specific behavior.
- Keep model-provider code isolated behind routing interfaces.
- Treat ranking formulas and prompt behavior as product decisions that must be documented.
- Avoid adding direct frontend dependencies or public browser-facing endpoints.

## When to Split Work

Split an implementation step if it combines:

- Embedding ingestion and chat response generation.
- ChromaDB schema changes and ranking formula changes.
- Groq/Ollama provider clients and unrelated API routers.
- Sentiment analysis and fake-review moderation.
- Backend transport changes and AI algorithm changes.
- Behavior not clearly defined in the context files.

If a change cannot be verified with focused tests or controlled fixtures, reduce the scope.

## Handling Missing Requirements

- Do not invent final ranking weights without recording the decision.
- Do not invent moderation thresholds without an open question or configuration.
- If backend request fields are missing, define the expected schema and record the dependency in `progress-tracker.md`.
- If retrieved context is insufficient, return a controlled low-context response instead of hallucinating.

## Protected Files

Do not modify the following unless explicitly instructed:

- Local model cache directories.
- ChromaDB persisted data directories except through application code or controlled test fixtures.
- Lockfiles or package manager metadata unless required by the current implementation.
- Third-party library internals.

## Version Control

- Start implementation work from a dedicated branch named for the scope, such as `feature/ai-review-embeddings`, `fix/ai-groq-fallback`, or `chore/ai-context-docs`.
- Check `git status --short` before editing, before committing, and before handing off work.
- Keep commits small and tied to one verifiable unit of work.
- Use clear Conventional Commit-style messages, such as `feat(ai): add semantic review search`, `fix(ai): handle empty retrieval context`, or `docs(ai): update RAG workflow rules`.
- Do not include unrelated files in a commit. If unrelated user changes are present, leave them untouched and commit only the files required for the current task.
- Run the relevant verification command before committing when implementation code changes; document any skipped verification in the handoff.
- Keep prompt, ranking, and vector metadata changes in the same commit as the code or tests that depend on them.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- API contracts for AI endpoints.
- Vector metadata schema or collection strategy.
- Prompt templates, prompt versions, and ranking formula decisions.
- Provider routing, fallback behavior, or timeout policy.
- Current progress, blockers, and cross-service dependencies.

## Before Moving to the Next Unit

1. The current AI capability works within its defined scope.
2. No invariant in `architecture.md` was violated.
3. `progress-tracker.md` reflects completed work and open backend/frontend dependencies.
4. Tests cover schema validation, success behavior, and at least one failure path.
5. `python -m pytest` passes when an AI service project is present.
