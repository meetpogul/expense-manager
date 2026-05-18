# Feature: Transactions

## Purpose

Transactions are the core money-movement domain. This feature records income
and expenses, enforces transaction invariants, and keeps account balances in
sync with compensating rollback logic.

## Architecture

```text
transactions/
├── components/        UI: TransactionForm, TransactionList, TransactionFilters
├── domain/            Entity, value objects, schemas, validation, formatters
├── application/       Ports, record DTOs, mappers, create/update/delete use cases
├── infrastructure/    Supabase repository and row mapper
├── hooks/             Filter/query-param state
└── server/            Thin Next.js actions and read queries
```

`Transaction` is a class because it owns real rules: expenses require a
category, balance effects depend on type, and edits must preserve identity while
changing the account/category/date/amount payload.

## Data Flow

```text
Client form
  -> server/actions.ts validates FormData
  -> application/use-cases/* orchestrate mutation + balance sync
  -> infrastructure/supabase-transaction.repository.ts writes rows
  -> shared revalidation refreshes dashboard, transactions, accounts, categories
```

## Business Rules

- Expenses require a category; income may omit it.
- Income increases account balance; expense decreases it.
- Editing reverses the previous effect and applies the new effect.
- Moving a transaction between accounts updates both accounts in order.
- Delete is soft delete (`deleted_at`) and reverses the transaction effect.
- If balance sync fails after a write, the use case compensates by restoring the
  transaction row or soft-deleting the created row.
