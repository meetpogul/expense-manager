---
name: create-hook
description: Hook creation workflow for reusable React hooks, URL/search-param parsing, filter state, UI state, and useSomething helpers. Use when asked to add or refactor hooks.
---

# Create Hook

1. Read `.codex/rules/architecture.md`, `.codex/rules/reusability.md`, and `.codex/rules/testing.md`.
2. Prefer `features/<name>/hooks/` for feature-specific state.
3. Extract shared hooks only after multiple features need the same behavior.
4. Keep parsing and transformation logic pure where possible.
5. Export public hooks from the feature barrel when they are part of the feature API.
6. Add pure helper tests for parsing and edge cases.
