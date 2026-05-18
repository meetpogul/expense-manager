---
name: review-changes
description: Risk-aware code review workflow using change detection, impact analysis, architecture rules, and test coverage checks. Use when reviewing diffs, PRs, recent edits, or robustness before merging.
---

# Review Changes

1. Read `.codex/rules/architecture.md`, `.codex/rules/testing.md`, and `.codex/rules/ai-safety.md`.
2. Run graph change detection when available, starting with minimal context.
3. Inspect high-risk changed code, affected flows, and nearby tests.
4. Report bugs, regressions, boundary violations, and missing tests first.
5. Use `architect` or `test-coverage-guardian` for fixes when review findings require edits.
