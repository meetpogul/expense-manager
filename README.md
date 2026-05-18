# Expense Manager

Modern Next.js App Router expense manager with an offline-first PWA foundation
and pragmatic feature/domain architecture.

## Stack

- Next.js 16 with App Router
- TypeScript
- pnpm
- PWA manifest and service worker
- Typed PWA install, service worker, and notification helpers
- Tailwind CSS v4 and shadcn/ui source components
- White-label theme tokens via CSS variables
- IndexedDB abstraction with `idb`
- Zustand global state
- Supabase auth and data access helpers
- Zod and React Hook Form for validated forms
- ESLint and Prettier
- Husky and lint-staged
- Vitest and Testing Library
- Absolute imports with `@/*`

## Folder Structure

```text
.
|-- public/
|   |-- icons/
|   |   |-- icon-180.png
|   |   |-- icon-192.png
|   |   |-- icon-384.png
|   |   `-- icon-512.png
|   |-- manifest.json
|   |-- offline.html
|   `-- sw.js
|-- src/
|   |-- app/
|   |   |-- favicon.ico
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |   |-- layout/
|   |   |-- service-worker-registration.tsx
|   |   `-- ui/
|   |-- features/
|   |   |-- auth/
|   |   |   |-- components/
|   |   |   `-- server/
|   |   `-- finance/
|   |       |-- components/
|   |       |-- domain/
|   |       `-- server/
|   |-- lib/
|   |   |-- db/
|   |   |   |-- config.ts
|   |   |   |-- crud.ts
|   |   |   `-- index.ts
|   |   |-- pwa/
|   |   |   |-- index.ts
|   |   |   |-- install.ts
|   |   |   `-- register.ts
|   |   |-- notifications/
|   |   |   |-- index.ts
|   |   |   |-- permissions.ts
|   |   |   |-- show.ts
|   |   |   `-- types.ts
|   |   |-- theme/
|   |   |   `-- tokens.ts
|   |   `-- utils/
|   |       |-- cn.ts
|   |       `-- index.ts
|   `-- store/
|       |-- counter-store.ts
|       `-- index.ts
|-- test/
|   `-- setup.ts
|-- .env.example
|-- .husky/
|   `-- pre-commit
|-- .prettierignore
|-- .prettierrc
|-- components.json
|-- eslint.config.mjs
|-- next.config.ts
|-- package.json
|-- postcss.config.mjs
`-- tsconfig.json
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Production PWA Check

The service worker only registers in production to keep development predictable.

```bash
pnpm build
pnpm start
```

Load the app once, then test offline mode from browser dev tools. Navigations use
a network-first strategy with an offline fallback, static assets use cache-first,
and other same-origin GET requests use stale-while-revalidate.

## PWA Helpers

Use `src/lib/pwa` for install prompt and service worker utilities. Use
`src/lib/notifications` for typed notification permission checks and local
notification display. Notification permission is never requested automatically;
call `requestNotificationPermission()` only from a user action such as a button.

## Scripts

```bash
pnpm lint
pnpm format
pnpm format:check
pnpm test
pnpm test:run
pnpm build
```

## UI System

Tailwind tokens live in `src/app/globals.css`. shadcn/ui is configured in
`components.json`, with reusable primitives in `src/components/ui`. Brand or
white-label customization can be done by overriding CSS variables, for example
with the included `.theme-brand` class.

## Feature Architecture

Reusable platform code stays shared under `src/lib` and `src/components`.
Business rules, schemas, feature queries, mutations, server actions, and
feature-specific UI live under `src/features/<feature>`. Keep new domains small:
extract shared helpers only when multiple domains need the same concept for the
same reason.
