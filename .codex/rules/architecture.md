# Architecture Rules

- Follow the pragmatic DDD boundaries in `AGENTS.md`.
- Keep feature code under `src/features/<name>/` with `domain`, `components`, `hooks`, and `server`; add `application` and `infrastructure` only when orchestration or adapters justify them.
- Keep rich domain patterns for business-heavy areas such as accounts and transactions; keep auth, categories, dashboard, PWA, notifications, and UI lightweight until rules grow.
- Import server actions and queries directly from `server/*`; never export `server/*` from feature barrels.
- Components may call their own feature server actions, but must not import `server/queries`.
- Cross-feature imports may use domain types, constants, and query helpers where allowed by `AGENTS.md`; never import another feature's `server/actions.ts`.
- Keep `src/components/ui` generic and free of feature imports.
