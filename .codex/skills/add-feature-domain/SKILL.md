---
name: add-feature-domain
description: Step-by-step workflow for creating a new pragmatic DDD feature domain. Use when adding budgets, goals, loans, recurring, or any new src/features/<name> domain.
---

## Add Feature Domain

When asked to add a new feature (e.g., `budgets`, `goals`, `recurring`), read `.codex/rules/architecture.md`, `.codex/rules/reusability.md`, and `.codex/rules/testing.md`, then follow this layer-by-layer build sequence.

### Step-by-Step Workflow

1. **Scaffold Directory**
   Create `src/features/<name>/` with:
   `components/`, `domain/`, `hooks/`, `server/`

2. **Domain Layer (Start Here)**
   - Create `domain/types.ts`: Define the plain TypeScript interfaces.
   - Create `domain/constants.ts`: Define enums, limits, and type labels.
   - Create `domain/<name>.schema.ts`: Define Zod schemas and import arrays from `constants.ts`.

3. **Application / Infrastructure Layer (Conditional)**
   - Add `application/` and `infrastructure/` only when mutation orchestration, repositories, or persistence adapters are justified by the feature's rules.
   - Keep simple domains flat when server actions and queries are enough.

4. **Server Layer**
   - Create `server/queries.ts`: Data fetching functions receiving the Supabase client.
   - Create `server/actions.ts`: Server actions for mutations (`"use server"`).

5. **Component Layer**
   - Create UI components in `components/`.
   - Use `src/components/ui/` primitives.
   - Components only import from `domain/` and `server/actions.ts`.

6. **Public API (Barrel)**
   - Create `index.ts` exporting: domain types, schema types, constants, hooks, components.
   - **CRITICAL**: Do NOT export `server/actions` or `server/queries` from the barrel.

7. **Documentation**
   - Create `README.md` explaining the feature's purpose, data flow, and business rules.

8. **Integration**
   - Add the necessary pages under `src/app/`.
   - Update `test/setup.ts` to mock the new feature's server actions.
   - Update `vitest.config.ts` to include the new feature's components and domain files in coverage.

Always complete the Domain layer before writing any Server or Component code.
