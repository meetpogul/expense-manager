---
name: ai-change-workflow
description: Safe AI coding workflow for making code changes without breaking tests. Use for implementation prompts, refactors, bug fixes, test repairs, or any request that should run checks before and after editing.
---

# AI Change Workflow

1. Read `.codex/rules/ai-safety.md` and `.codex/rules/testing.md`.
2. Run `git status --short` and `pnpm check:ai:start` when feasible.
3. Select any more specific skill that matches the task.
4. Make the smallest code and test changes that satisfy the request.
5. Run targeted tests while iterating.
6. Finish with `pnpm check:ai:end` when source, tests, PWA, or config changed.
