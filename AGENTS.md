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
pnpm typecheck
pnpm test:run
pnpm check:coverage
pnpm check:ai:start
pnpm check:ai:end
pnpm build
pnpm format
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
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
- `src/stores`: modular Zustand stores (note: plural, not `store/`)
- `src/test`: test setup
- `.codex/rules`: canonical project rules for AI tools
- `.codex/agents`: small role prompts that point to rules and skills
- `.codex/skills`: project-local Codex skills only

### Feature Domains

Each feature lives under `src/features/<name>/` with pragmatic DDD layers:

```
features/<name>/
├── components/   # UI layer — React components and colocated tests
├── domain/       # Business rules — schemas, types, validation, entities/value objects when useful
├── application/  # Use cases and ports when orchestration is non-trivial
├── infrastructure/ # Supabase adapters and persistence mappers
├── hooks/        # Reusable feature hooks (filters, UI state)
└── server/       # Server actions and Supabase queries
```

Current feature domains:

- `features/auth` — authentication forms and session helpers
- `features/accounts` — account CRUD and balance management
- `features/categories` — category CRUD (system + user-defined)
- `features/transactions` — transaction mutations, balance sync, formatters
- `features/dashboard` — aggregate view (SummaryCard; grows as reporting expands)

Future planned domains: `budgets`, `goals`, `loans`, `recurring`

Each feature exposes a public API via `index.ts` that re-exports domain types,
schema types, constants, hooks, and components. Server modules (`server/actions`,
`server/queries`) are **not** re-exported from the barrel — import those
directly to keep the `"use server"` / `server-only` boundary explicit.

Each feature domain also has `domain/constants.ts` for enums, labels, limits,
and string literals. Prefer importing from there over redeclaring inline.

Do not recreate extra agent folders such as `.agents`, `.claude`, `.cursor`, or
`.kiro`. Rules belong in `.codex/rules`, role prompts belong in
`.codex/agents`, and skills belong in `.codex/skills`.

## Architecture Boundaries

This project uses **hybrid practical DDD**. Rich business domains such as
`accounts` and `transactions` may use class-based entities, value objects,
application use cases, ports, and infrastructure adapters. Simpler domains such
as `auth`, `categories`, `dashboard`, PWA, notifications, and UI should stay
lighter unless real business rules justify more structure.

### Use Deliberately

These patterns are useful only where business rules justify them:

| Pattern                 | Guidance                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Repositories            | Use only as infrastructure adapters behind application ports; do not wrap simple read queries without a reason     |
| Use cases / interactors | Use for transactions/accounts mutation orchestration; keep server actions thin                                     |
| Entity classes          | Use for rich invariants such as `Account` and `Transaction`; keep categories/auth/dashboard plain until rules grow |
| CQRS                    | Overkill; read and write paths are already naturally separated                                                     |
| Event sourcing          | Not applicable at this scale                                                                                       |
| Deep abstraction chains | Each feature is readable in isolation — keep it that way                                                           |

### Intentionally Deferred (add only when the trigger is met)

These patterns are valid but premature right now:

| Pattern           | Location                    | Add when…                                                                                                  |
| ----------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `services/` layer | `features/<name>/services/` | Multiple server actions need to orchestrate across each other or business workflows grow complex           |
| Route co-location | `features/<name>/routes/`   | The `src/app/` pages for a feature grow large enough that co-locating them with the feature is a clear win |
| `src/providers/`  | `src/providers/`            | You need to share React context (theme, auth state, query client) across the component tree                |

When a trigger is met, add the layer to the affected feature only — do not
pre-emptively add it to all features.

## Working with This Architecture

### Adding a new feature domain

1. Create `src/features/<name>/` with the standard directories:
   `components/`, `domain/`, `hooks/`, `server/`
2. Start in `domain/` — define `types.ts`, `constants.ts`, and `<name>.schema.ts`
   before writing any UI or server code
3. If mutation orchestration is non-trivial, add `application/` ports/use cases
   and `infrastructure/` adapters. Otherwise keep the feature flat.
4. Add `server/queries.ts` (reads) and `server/actions.ts` (writes) next
5. Build components last — they should only import from `domain/` and
   `server/actions` (never from `server/queries` directly)
6. Add `index.ts` barrel exporting domain types, schema types, constants,
   hooks, and components — **exclude** `server/` from the barrel
7. Write a `README.md` covering purpose, data flow, and business rules
8. Add page(s) under `src/app/` that wire the server queries to the components
9. Register new server action mocks in `test/setup.ts`

### Modifying an existing feature

- **Domain change** (new field, rule): update value objects/entities if present,
  then `types.ts` → `<name>.schema.ts` → `validation.ts` → application use cases
  → `server/actions.ts`. TypeScript will surface every broken call site.
- **UI change only**: edit the component; domain and server stay untouched.
- **Query change**: edit `server/queries.ts`; revalidation paths live in
  `server/actions.ts` — check those too.
- **New constant / label**: add to `domain/constants.ts`, never inline.

### Cross-feature imports

Follow this dependency direction — never go the other way:

```
transactions → accounts   (reads account balance, uses Account type)
transactions → categories (uses Category type in form props)
categories   → transactions (imports TransactionType to define CategoryType)
dashboard    → transactions, accounts, categories (read-only aggregate)
```

Rules:

- A feature may import **domain types and query helpers** from another feature.
- A feature must **never** import from another feature's `server/actions.ts`
  (actions own their own revalidation paths).
- `src/components/ui/` is available to all features.
- `src/lib/` utilities are available to all features.

### Writing tests

- Unit tests for pure logic go in `domain/__tests__/`.
- Component tests go in `components/__tests__/` colocated with the component.
- Server mutation tests use the `InMemoryRepository` pattern established in
  `transactions/server/__tests__/mutations.test.ts` — no real Supabase calls.
- Mock all `server/actions` in `test/setup.ts` so component tests never
  reach the network.
- Mock `server-only` in `test/setup.ts` so Vitest (jsdom) does not reject it.

### Import paths — prefer the barrel

```ts
// ✅ Prefer: clean public API
import type { Transaction } from "@/features/transactions";
import { formatCurrency } from "@/features/transactions";

// ✅ Also fine: direct path for server modules (required for "use server")
import { createTransactionAction } from "@/features/transactions/server/actions";

// ❌ Avoid: reaching into internals when a barrel exists
import type { Transaction } from "@/features/transactions/domain/types";
```

## Architecture Evolution Roadmap

The architecture grows **one layer at a time**, only when a trigger is met.
Each phase below is additive — nothing from earlier phases is removed.

### Phase 1 — Current state ✅

```
features/<name>/
├── components/     UI + colocated tests
├── domain/         types, schema, constants, validation, entities/value objects where useful
├── application/    ports + use cases for non-trivial mutation workflows
├── infrastructure/ Supabase adapters and persistence mappers
├── hooks/          URL params, filter state, reusable UI logic
├── server/         queries + actions (thin use-case layer)
├── index.ts        public barrel
└── README.md
```

Covers: `auth`, `accounts`, `categories`, `transactions`, `dashboard` (stub).
`accounts` and `transactions` use the richer class-based path; the other
features stay lightweight until their rules grow.

### Phase 2 — Expand dashboard

**Trigger:** reporting, charts, or period comparisons are added.

```
features/dashboard/
├── components/     SummaryCard, BarChart, PeriodSelector, …
├── domain/         DashboardSummary type (move from transactions)
├── hooks/          useDashboardPeriod
└── server/         getDashboardSummary (move from transactions/server/queries)
```

`DashboardSummary` currently lives in `transactions/domain/types.ts`. Move it
here when the dashboard becomes a first-class feature.

### Phase 3 — Add new planned domains

**Trigger:** user requests the feature.

Add each as a full feature domain following Phase 1 structure:

| Domain               | Purpose                                |
| -------------------- | -------------------------------------- |
| `features/budgets`   | Monthly spend limits per category      |
| `features/goals`     | Savings targets with progress tracking |
| `features/loans`     | Loan and EMI tracking                  |
| `features/recurring` | Scheduled repeating transactions       |

Cross-feature note: `recurring` will need to call transaction mutations —
that is the first candidate for a `services/` layer if orchestration grows.

### Phase 4 — Add `services/` (only if triggered)

**Trigger:** multiple server actions need to orchestrate together.

```
features/recurring/
└── services/
    └── recurring-processor.ts   # orchestrates recurring → transaction creation
```

Add to the affected feature only. Do not create `services/` project-wide.

### Phase 5 — Add `src/providers/` (only if triggered)

**Trigger:** shared React context is needed across the component tree.

```
src/providers/
├── query-provider.tsx    # e.g. React Query client
├── theme-provider.tsx
└── index.tsx             # composes all providers
```

### Phase 6 — Route co-location (only if triggered)

**Trigger:** `src/app/<feature>/` pages grow large and complex.

```
features/transactions/
└── routes/
    ├── transactions-page.tsx
    └── edit-transaction-page.tsx
```

`src/app/transactions/page.tsx` becomes a thin shell that imports from
`features/transactions/routes/`.

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
pnpm typecheck
pnpm test:run
pnpm check:coverage
pnpm build
```

For service worker edits, also run:

```bash
node --check public/sw.js
```

When using the in-app browser, verify `http://localhost:3000/` after changes.
