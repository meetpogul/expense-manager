# Recurring

Recurring rules describe repeating income or expense templates. Phase 2 supports
manual due execution; automatic background generation is reserved for a later
automation phase.

## Data Flow

- `server/queries.ts` reads rules with account and category labels.
- `server/actions.ts` validates forms, runs use cases, writes through the Supabase repository, and revalidates finance routes.
- `application/use-cases/execute-recurring-rule.use-case.ts` creates one due transaction, prevents duplicates, and advances `next_due_date`.
- Components show frequency, next date, and due actions clearly so the feature stays simple.

## Business Rules

- Amounts must be greater than 0.
- Expense rules require a category; income rules may omit one.
- Next due date must be on or after the start date.
- Manual execution only runs active rules due today or earlier.
- A due date is generated once; existing linked transactions prevent duplicates.
- Rules are paused by setting `is_active = false`; the table has no soft-delete column.
