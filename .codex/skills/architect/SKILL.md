---
name: architect
description: Architecture and DDD workflow for feature boundaries, folder placement, import rules, refactors, and design review. Use when changing structure, adding layers, reviewing pragmatic DDD, or deciding where code belongs.
---

# Architect

1. Read `.codex/rules/architecture.md` and `.codex/rules/reusability.md`.
2. Inspect the touched feature, existing imports, barrels, and tests.
3. Choose the smallest structure that satisfies the current behavior.
4. Keep `server/*` out of feature barrels and keep component/query/action boundaries explicit.
5. If a new domain is needed, hand off to `add-feature-domain`.
6. If tests or coverage are affected, hand off to `test-coverage-guardian`.
