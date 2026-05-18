---
name: test-coverage-guardian
description: Unit test and coverage workflow. Use when adding tests, fixing failing tests, checking robustness, improving coverage, or deciding which tests a code change needs.
---

# Test Coverage Guardian

1. Read `.codex/rules/testing.md`.
2. Inspect changed files, nearby tests, `vitest.config.ts`, and `coverage/coverage-summary.json` if present.
3. Add focused tests for behavior, edge cases, and regressions.
4. Keep component tests mocked through `test/setup.ts`.
5. Use in-memory repositories for server mutation tests.
6. Run the smallest relevant test first, then `pnpm check:coverage` when coverage policy is affected.
