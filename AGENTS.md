# Agent Guide

This repository is a setup-focused Next.js Progressive Web App foundation. Keep
changes generic and architecture-oriented unless the user explicitly asks for
domain features.

## Project Stack

- Next.js 16 App Router with TypeScript and pnpm
- Tailwind CSS v4 with shadcn/ui source components
- Lucide icons with tree-shakeable named imports
- Offline-first PWA setup with `public/sw.js` and `public/manifest.json`
- IndexedDB abstraction with `idb`
- Zustand for lightweight global state
- Supabase browser/server helpers with `@supabase/ssr`
- Vitest and Testing Library
- ESLint, Prettier, Husky, and lint-staged

## Common Commands

```bash
pnpm dev
pnpm lint
pnpm test:run
pnpm build
pnpm format
```

Use `pnpm` for package operations. Do not use `npm install` or `npx` when a
`pnpm` equivalent exists.

## Folder Conventions

- `src/app`: App Router layout, pages, and global CSS tokens
- `src/components/ui`: reusable shadcn-style primitives
- `src/components/layout`: app layout primitives
- `src/lib/pwa`: install prompt and service worker helpers
- `src/lib/notifications`: typed notification permission/display helpers
- `src/lib/db`: IndexedDB config and generic CRUD helpers
- `src/lib/client.ts`, `src/lib/server.ts`, `src/lib/middleware.ts`: Supabase helpers
- `src/store`: modular Zustand stores
- `test`: test setup
- `.codex/skills`: project-local Codex skills only

Do not recreate extra agent folders such as `.agents`, `.claude`, `.cursor`, or
`.kiro`. If a tool installs skills into those folders, move the needed skills
under `.codex/skills` and remove the extra folders.

## PWA Rules

- Keep `public/sw.js` dependency-free and browser-compatible.
- Service worker registration should stay in client-only code.
- Do not request notification permission automatically. Permission prompts must
  be triggered by an explicit user action.
- Keep notification utilities generic. No domain-specific message types here.
- Maintain installability across modern browsers with valid manifest fields and
  PNG icons.
- Remember that service workers register only in production in this project.
  Use `pnpm build` and `pnpm start` for production PWA checks.

## IndexedDB Rules

- Keep database helpers generic and type-safe.
- Do not add business/domain stores unless requested.
- Prefer `JsonValue`-compatible stored values for predictable serialization.
- Update `DB_VERSION` and migration logic deliberately when changing schema.

## Supabase Rules

- Use publishable browser keys only in `NEXT_PUBLIC_*` variables.
- Never expose service role or secret keys in client-side code.
- Use the Supabase skills in `.codex/skills` for Supabase-specific work.
- For schema, RLS, storage, or auth changes, verify current Supabase guidance
  before implementation.

## UI Rules

- Use shadcn-style components from `src/components/ui` before custom markup.
- Use semantic Tailwind tokens such as `bg-background`, `text-muted-foreground`,
  and `border-border`.
- Use `cn()` for class merging.
- Use Lucide named imports, not dynamic icon maps.
- Keep UI minimal and setup-focused.

## Verification

For setup or architecture changes, run:

```bash
pnpm lint
pnpm test:run
pnpm build
```

For service worker edits, also run:

```bash
node --check public/sw.js
```

When using the in-app browser, verify `http://localhost:3000/` after changes.
