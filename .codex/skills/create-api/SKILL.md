---
name: create-api
description: Server API workflow for Next.js server actions, server queries, route handlers, endpoints, webhooks, Supabase reads/writes, and mutation/query contracts. Use when asked to create or change API, endpoint, action, query, route.ts, or webhook behavior.
---

# Create API

1. Read `.codex/rules/architecture.md`, `.codex/rules/testing.md`, and Supabase rules when data access changes.
2. Prefer `features/<name>/server/queries.ts` for reads and `server/actions.ts` for app mutations.
3. Use `app/**/route.ts` only for external HTTP consumers, webhooks, or non-UI contracts.
4. Keep validation in domain schema/validation helpers and orchestration in application use cases when non-trivial.
5. Add server mutation tests with in-memory repositories; avoid real Supabase in unit tests.
