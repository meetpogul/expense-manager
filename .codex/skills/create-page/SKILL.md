---
name: create-page
description: App Router page workflow for routes, screens, layouts, server component wiring, and navigation pages. Use when asked to create or update a page, route, screen, or Next.js App Router view.
---

# Create Page

1. Read `.codex/rules/architecture.md`, `.codex/rules/ui-ux.md`, and `.codex/rules/testing.md`.
2. Keep `src/app` pages thin: authenticate, load queries, pass data to feature components.
3. Do not put business rules or mutation orchestration in pages.
4. Import server queries directly from feature `server/queries.ts`.
5. Use `ui-ux` or `create-ui-component` for substantial UI work.
6. Add tests to the feature/component layer rather than testing page wiring unnecessarily.
