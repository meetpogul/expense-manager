# Budgets

Budgets help users see spending health for a category or all expenses.

## Data Flow

- `server/queries.ts` reads budgets and only the expense transactions in the active budget windows.
- `domain/usage.ts` calculates period windows, used amount, remaining amount, percent used, and status.
- `server/actions.ts` validates forms, runs use cases, writes through the Supabase repository, and revalidates finance routes.

## Business Rules

- Budget limits must be greater than 0.
- `category_id = null` means the budget tracks overall expense spending.
- Status is safe below 80%, warning from 80% to 99%, and alert at 100% or above.
- Pausing sets `is_active = false`; users do not hard-delete budgets from the primary UI.
- Deletes are soft deletes through `deleted_at`.
