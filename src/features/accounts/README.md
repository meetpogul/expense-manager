# Feature: Accounts

## Purpose

Accounts represent cash wallets, bank accounts, cards, UPI, and other balances.
They are the balance-holding side of transaction tracking.

## Architecture

```text
accounts/
├── components/        UI: AccountForm
├── domain/            Account entity, AccountId, schema, validation, constants
├── application/       Account repository port and create/update/delete use cases
├── infrastructure/    Supabase account repository
└── server/            Thin Next.js actions and read queries
```

`Account` is a class because balance changes are business behavior. It exposes
`credit`, `debit`, `applyTransactionEffect`, and `softDelete` while keeping the
stored props immutable.

## Business Rules

- Accounts are soft-deleted by setting `is_active = false` and `deleted_at`.
- Transaction mutations update account balance through the transaction use cases.
- Default accounts are sorted first by query helpers and used by forms.
- Supabase numeric values are normalized before entering app/domain logic.
