# AI Safety Rules

- Read `AGENTS.md`, relevant `.codex/rules/*.md`, and matching skills before editing.
- Choose skills by `SKILL.md` descriptions; use the smallest matching workflow.
- Run `pnpm check:ai:start` before substantial edits when the tree can already run tests.
- Preserve user changes. Do not revert unrelated files or broad-rewrite stable code.
- Inspect current code patterns before adding abstractions, dependencies, or folders.
- Update code and tests together when behavior changes.
- Run `pnpm check:ai:end` before handoff when changes affect source, tests, PWA, or config.
