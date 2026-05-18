---
name: create-ui-component
description: UI component workflow for shadcn-style components, forms, lists, cards, empty states, loading states, buttons, and component tests. Use when asked to create or change reusable UI or feature components.
---

# Create UI Component

1. Read `.codex/rules/ui-ux.md`, `.codex/rules/reusability.md`, and `.codex/rules/testing.md`.
2. Use `src/components/ui` primitives and semantic Tailwind tokens first.
3. Keep generic primitives under `src/components/ui`; keep domain UI under `features/<name>/components`.
4. Use Lucide named imports for icons and `cn()` for class merging.
5. Keep components accessible and responsive with clear empty, pending, and error states.
6. Add component tests for user-visible behavior.
