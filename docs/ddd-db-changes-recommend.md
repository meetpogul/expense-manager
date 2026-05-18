# Future DDD Database Recommendations

No database changes are required for the current architecture refactor.

Use this file only for future feature work where a database change would improve
the domain model, performance, data integrity, or long-term maintainability.

## Architecture Principle

DDD-inspired architecture does not mean repeating the same infrastructure for
every domain. Keep reusable platform concerns shared, and keep business rules
close to the feature or domain that owns them.

Shared and reusable:

- Supabase client creation and auth/session helpers
- Generic repository helpers when they are truly domain-agnostic
- Database utility types, pagination helpers, date helpers, and error mapping
- UI primitives, layout components, and theme tokens
- Cross-cutting validation helpers that are not business-specific

Feature-owned:

- Domain schemas and business validation rules
- Query intent and data mapping for feature screens
- Mutations that enforce domain invariants
- Server actions and route orchestration
- Feature-specific UI and form composition

Avoid creating repeated folders or boilerplate just because a pattern exists.
Start with the smallest useful boundary, then extract shared code only after at
least two domains need the same concept for the same reason.

## When To Recommend Database Changes

Recommend database changes only when a future feature needs one of these:

- A new persistent business concept that does not fit existing tables
- A stronger integrity rule that belongs in the database, not only in app code
- A query that is repeatedly expensive and needs an index, view, or summary table
- A security boundary that needs RLS, policy, function, or storage changes
- Auditability, sync, analytics, or soft-delete behavior not covered by current schema

Do not recommend schema changes for purely frontend layout, folder structure,
theme, navigation, or component refactors.

## Future Recommendation Format

When a database recommendation is needed, document it here with:

- Feature or domain name
- Problem being solved
- Proposed schema or policy change
- Why app-only logic is not enough
- Backward compatibility impact
- Required tests or Supabase verification steps

## Current Notes

- The current finance feature can be reorganized into feature/domain folders
  without changing the Supabase schema.
- Existing account, category, and transaction behavior should remain compatible.
- Any future RLS, schema, or migration work should be planned separately from
  the architecture refactor and verified against current Supabase guidance.
