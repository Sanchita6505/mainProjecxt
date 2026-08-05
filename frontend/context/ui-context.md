# UI Context

## Theme

The AI service has no direct UI surface. It supports frontend AI experiences through backend-mediated APIs. Responses should be concise, structured, source-aware, and easy to render in recommendation cards, chat messages, summaries, moderation queues, and analytics panels.

## Colors

Not applicable for AI service implementation. Do not introduce UI color tokens in AI-service code.

## Typography

Not applicable for AI service implementation.

## Border Radius

Not applicable for AI service implementation.

## Component Library

Not applicable for AI service implementation. Chat and recommendation UI components are owned by the frontend.

## Layout Patterns

- Chat responses should separate answer text, ranked vendors, reasoning snippets, and source references.
- Recommendation responses should expose machine-readable score metadata and human-readable explanation text.
- Sentiment and moderation responses should expose labels, confidence, and evidence fields for dashboard rendering.
- Summary responses should be short enough for vendor detail panels and expandable review sections.

## Icons

Not applicable for AI service implementation.
