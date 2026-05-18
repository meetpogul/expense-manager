# Budget Tracker — Full Database Documentation

**Project:** `budget-tracker`  
**Project ID:** `gfcjvmrwqkecfrksbhzu`  
**Host:** `db.gfcjvmrwqkecfrksbhzu.supabase.co`  
**Region:** `ap-south-1`  
**Postgres:** `17.6.1`  
**Generated:** `2026-05-10`  
**Schema Version:** `v3-final`  
**Security Advisors:** ✅ 0 open  
**Performance Advisors:** ✅ 0 open

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Tables](#tables)
   - [profiles](#profiles)
   - [categories](#categories)
   - [accounts](#accounts)
   - [recurring_rules](#recurring_rules)
   - [transactions](#transactions)
   - [transfers](#transfers)
   - [budgets](#budgets)
   - [savings_goals](#savings_goals)
   - [loans](#loans)
   - [loan_payments](#loan_payments)
   - [debts](#debts)
   - [subscriptions](#subscriptions)
   - [projects](#projects)
   - [notification_settings](#notification_settings)
   - [net_worth_snapshots](#net_worth_snapshots)
   - [wishlist](#wishlist)
4. [Views](#views)
5. [Functions & Triggers](#functions--triggers)
6. [RLS Policies](#rls-policies)
7. [Indexes](#indexes)
8. [Known Issues & Recommended Fixes](#known-issues--recommended-fixes)
9. [Soft Delete Strategy](#soft-delete-strategy)
10. [Query Examples](#query-examples)

---

## Overview

The database supports a personal expense manager application with the following feature areas:

| Feature Area             | Tables                                             |
| ------------------------ | -------------------------------------------------- |
| User identity & settings | `profiles`, `notification_settings`                |
| Money accounts           | `accounts`                                         |
| Transactions             | `transactions`, `transfers`, `recurring_rules`     |
| Budgeting                | `budgets`, `categories`                            |
| Saving                   | `savings_goals`, `wishlist`, `net_worth_snapshots` |
| Loans & EMI              | `loans`, `loan_payments`                           |
| Debts                    | `debts`                                            |
| Subscriptions            | `subscriptions`                                    |
| Projects / Events        | `projects`                                         |

**Security:** Row Level Security (RLS) is enabled on all 16 tables. All policies use `(SELECT auth.uid())` evaluated once per query for performance. All trigger functions have `SET search_path = public` and `EXECUTE` revoked from `anon` and `authenticated` roles.

**Soft Delete:** 4 tables use soft delete via `deleted_at`: `accounts`, `budgets`, `categories`, `transactions`. RLS policies filter `deleted_at IS NULL` so soft-deleted rows are invisible to users while preserving referential integrity.

---

## Architecture Diagram

```
auth.users
    │ (trigger: trg_on_auth_user_created)
    ▼
profiles ──────────────────────────────────────────────┐
    │                                                   │
    ├──→ notification_settings (1:1, auto-created)     │
    ├──→ accounts (1:many)                             │
    │       ├──→ transactions.account_id               │
    │       ├──→ recurring_rules.account_id            │
    │       ├──→ loans.account_id                      │
    │       ├──→ subscriptions.account_id              │
    │       └──→ transfers.from/to_account_id          │
    ├──→ categories (1:many, + system defaults)        │
    │       ├──→ transactions.category_id              │
    │       ├──→ budgets.category_id                   │
    │       ├──→ recurring_rules.category_id           │
    │       └──→ subscriptions.category_id             │
    ├──→ transactions (1:many)                         │
    │       ├──→ transfers.from/to_transaction_id      │
    │       ├──→ loan_payments.transaction_id          │
    │       └──→ (savings_goal_id, project_id)         │
    ├──→ savings_goals (1:many)                        │
    │       ├──→ transactions.savings_goal_id          │
    │       └──→ wishlist.savings_goal_id              │
    ├──→ projects (1:many)                             │
    │       └──→ transactions.project_id               │
    ├──→ budgets (1:many)                              │
    ├──→ loans (1:many)                                │
    │       └──→ loan_payments (1:many)                │
    ├──→ debts (1:many)                                │
    ├──→ subscriptions (1:many)                        │
    ├──→ recurring_rules (1:many)                      │
    │       └──→ transactions.recurring_id             │
    └──→ net_worth_snapshots (1:many)                  │
                                                       │
    Views (SECURITY INVOKER, respect RLS):             │
    ├──→ loan_analytics                                │
    ├──→ emi_reminders                                 │
    └──→ financial_health                              │
```

---

## Tables

---

### `profiles`

One row per authenticated user. Auto-created by a trigger on `auth.users` INSERT. Stores spending limits and app-wide preferences.

| Column                         | Type        | Nullable | Default | Notes                             |
| ------------------------------ | ----------- | -------- | ------- | --------------------------------- |
| `id` 🔑                        | uuid        | NO       | —       | FK → `auth.users.id` CASCADE      |
| `full_name`                    | text        | YES      | —       | From signup metadata              |
| `avatar_url`                   | text        | YES      | —       | From signup metadata              |
| `monthly_budget`               | numeric     | YES      | —       | Overall monthly spending cap      |
| `daily_limit`                  | numeric     | YES      | —       | Daily spending cap for alerts     |
| `weekly_limit`                 | numeric     | YES      | —       | Weekly spending cap for alerts    |
| `emergency_fund_target_months` | smallint    | YES      | `6`     | Target months of expenses to save |
| `created_at`                   | timestamptz | NO       | `now()` |                                   |
| `updated_at`                   | timestamptz | NO       | `now()` | Auto-updated by trigger           |

**Triggers:** `trg_profiles_updated_at`, `trg_new_profile_notifications`  
**RLS:** `ALL` — `(SELECT auth.uid()) = id`

> **Note:** `currency_code` was removed. Consider re-adding if multi-currency display is needed.

---

### `categories`

Expense/income categories. Rows with `user_id = NULL` are system defaults visible to all users (13 seeded on migration). Users may add their own. Soft-deleted via `deleted_at`.

| Column       | Type        | Nullable | Default              | Notes                                             |
| ------------ | ----------- | -------- | -------------------- | ------------------------------------------------- |
| `id` 🔑      | uuid        | NO       | `uuid_generate_v4()` |                                                   |
| `user_id`    | uuid        | YES      | —                    | FK → `profiles.id` CASCADE. NULL = system default |
| `name`       | text        | NO       | —                    |                                                   |
| `icon`       | text        | YES      | —                    | Emoji or icon name                                |
| `color`      | text        | YES      | —                    | Hex color e.g. `#FF6B6B`                          |
| `type`       | text        | NO       | `'expense'`          | `expense` \| `income` \| `both`                   |
| `is_default` | boolean     | NO       | `false`              | TRUE for the 13 seeded system categories          |
| `created_at` | timestamptz | NO       | `now()`              |                                                   |
| `deleted_at` | timestamptz | YES      | —                    | Soft delete                                       |

**Seeded defaults:** Food & Dining, Transportation, Shopping, Housing & Rent, Utilities, Healthcare, Entertainment, Education, Investments, Salary, Freelance, Other Income, Miscellaneous

**Indexes:** `categories_pkey`, `idx_categories_user_id`, `idx_categories_user_active` (partial, `deleted_at IS NULL`)

**RLS:**

- `SELECT` — `deleted_at IS NULL AND (user_id IS NULL OR uid = user_id)` — system defaults visible to everyone
- `INSERT` — `uid = user_id`
- `UPDATE` — `uid = user_id`
- `DELETE` — `uid = user_id`

⚠️ **Issue:** No `updated_at` column — category edits leave no audit trail.

---

### `accounts`

All user money accounts. Supports multiple accounts per user across all types. The first account a user creates is automatically set as default. Exactly one `is_default = true` per user enforced by a partial unique index. Soft-deleted via `deleted_at`.

| Column       | Type        | Nullable | Default              | Notes                                                             |
| ------------ | ----------- | -------- | -------------------- | ----------------------------------------------------------------- |
| `id` 🔑      | uuid        | NO       | `uuid_generate_v4()` |                                                                   |
| `user_id`    | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                                        |
| `name`       | text        | NO       | —                    | e.g. "SBI Savings", "Cash Wallet"                                 |
| `type`       | text        | NO       | —                    | `cash` \| `bank` \| `credit_card` \| `upi` \| `wallet` \| `other` |
| `balance`    | numeric     | NO       | `0`                  | Current balance — app must keep this updated                      |
| `color`      | text        | YES      | —                    |                                                                   |
| `icon`       | text        | YES      | —                    |                                                                   |
| `is_default` | boolean     | NO       | `false`              | At most 1 true per user (partial unique index)                    |
| `is_active`  | boolean     | NO       | `true`               | UI soft-toggle, separate from soft-delete                         |
| `created_at` | timestamptz | NO       | `now()`              |                                                                   |
| `updated_at` | timestamptz | NO       | `now()`              |                                                                   |
| `deleted_at` | timestamptz | YES      | —                    | Soft delete                                                       |

**Indexes:**

- `accounts_pkey` — unique `(id)`
- `idx_accounts_user_id` — `(user_id)`
- `idx_accounts_one_default_per_user` — unique partial `(user_id) WHERE is_default = true`
- `idx_accounts_user_active` — partial `(user_id) WHERE deleted_at IS NULL`

**Triggers:** `trg_accounts_updated_at`, `trg_first_account_default` (BEFORE INSERT), `trg_account_default_update` (BEFORE UPDATE)

**RLS:** `ALL` — `uid = user_id AND deleted_at IS NULL`

⚠️ **Issue:** App must only ever soft-delete accounts (set `deleted_at`). Hard-deleting will be blocked by RESTRICT FK from `transactions` and `recurring_rules`.

---

### `recurring_rules`

Template definitions for auto-repeating transactions. App reads `next_due_date` to know when to generate a transaction. After generating, app advances `next_due_date` by the appropriate interval.

| Column          | Type        | Nullable | Default              | Notes                                                                     |
| --------------- | ----------- | -------- | -------------------- | ------------------------------------------------------------------------- |
| `id` 🔑         | uuid        | NO       | `uuid_generate_v4()` |                                                                           |
| `user_id`       | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                                                |
| `account_id`    | uuid        | NO       | —                    | FK → `accounts.id` RESTRICT                                               |
| `category_id`   | uuid        | YES      | —                    | FK → `categories.id` SET NULL                                             |
| `type`          | text        | NO       | —                    | `expense` \| `income`                                                     |
| `amount`        | numeric     | NO       | —                    | Must be > 0                                                               |
| `note`          | text        | YES      | —                    |                                                                           |
| `frequency`     | text        | NO       | —                    | `daily` \| `weekly` \| `biweekly` \| `monthly` \| `quarterly` \| `yearly` |
| `start_date`    | date        | NO       | —                    |                                                                           |
| `end_date`      | date        | YES      | —                    | NULL = no end                                                             |
| `next_due_date` | date        | NO       | —                    | App increments this after each generation                                 |
| `is_active`     | boolean     | NO       | `true`               |                                                                           |
| `created_at`    | timestamptz | NO       | `now()`              |                                                                           |
| `updated_at`    | timestamptz | NO       | `now()`              |                                                                           |

**RLS:** `ALL` — `uid = user_id`

⚠️ **Issue:** `account_id` is RESTRICT — must deactivate recurring rules before soft-deleting an account.

---

### `transactions`

The core financial ledger. Every income, expense, and transfer entry lives here. Supports linking to savings goals, projects, and recurring rules. Soft-deleted via `deleted_at`.

| Column            | Type        | Nullable | Default              | Notes                                                             |
| ----------------- | ----------- | -------- | -------------------- | ----------------------------------------------------------------- |
| `id` 🔑           | uuid        | NO       | `uuid_generate_v4()` |                                                                   |
| `user_id`         | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                                        |
| `account_id`      | uuid        | NO       | —                    | FK → `accounts.id` RESTRICT                                       |
| `category_id`     | uuid        | YES      | —                    | FK → `categories.id` SET NULL                                     |
| `type`            | text        | NO       | —                    | `expense` \| `income` \| `transfer`                               |
| `amount`          | numeric     | NO       | —                    | Must be > 0                                                       |
| `note`            | text        | YES      | —                    | Free text description                                             |
| `merchant_name`   | text        | YES      | —                    | e.g. "Swiggy", "DMart"                                            |
| `date`            | date        | NO       | `CURRENT_DATE`       |                                                                   |
| `time`            | time        | YES      | —                    | Optional time of day                                              |
| `payment_method`  | text        | YES      | —                    | `cash` \| `upi` \| `card` \| `net_banking` \| `cheque` \| `other` |
| `is_recurring`    | boolean     | NO       | `false`              | TRUE if generated from a recurring_rule                           |
| `recurring_id`    | uuid        | YES      | —                    | FK → `recurring_rules.id` SET NULL                                |
| `savings_goal_id` | uuid        | YES      | —                    | FK → `savings_goals.id` SET NULL — triggers auto-increment        |
| `project_id`      | uuid        | YES      | —                    | FK → `projects.id` SET NULL                                       |
| `tags`            | text[]      | YES      | —                    | Array of free-form tags e.g. `{food, weekend}`                    |
| `attachment_url`  | text        | YES      | —                    | Receipt photo URL                                                 |
| `location`        | text        | YES      | —                    | Optional location text                                            |
| `created_at`      | timestamptz | NO       | `now()`              |                                                                   |
| `updated_at`      | timestamptz | NO       | `now()`              |                                                                   |
| `deleted_at`      | timestamptz | YES      | —                    | Soft delete                                                       |

**Indexes (13 total):**

| Index                                 | Columns                      | Partial                    |
| ------------------------------------- | ---------------------------- | -------------------------- |
| `transactions_pkey`                   | `id` UNIQUE                  | —                          |
| `idx_transactions_user_id`            | `user_id`                    | —                          |
| `idx_transactions_date`               | `date DESC`                  | —                          |
| `idx_transactions_account_id`         | `account_id`                 | —                          |
| `idx_transactions_category_id`        | `category_id`                | —                          |
| `idx_transactions_type`               | `type`                       | —                          |
| `idx_transactions_recurring_id`       | `recurring_id`               | —                          |
| `idx_transactions_savings_goal`       | `savings_goal_id`            | —                          |
| `idx_transactions_project`            | `project_id`                 | —                          |
| `idx_transactions_merchant`           | `merchant_name`              | —                          |
| `idx_transactions_user_date`          | `user_id, date DESC`         | `WHERE deleted_at IS NULL` |
| `idx_transactions_user_type`          | `user_id, type`              | `WHERE deleted_at IS NULL` |
| `idx_transactions_user_category_date` | `user_id, category_id, date` | `WHERE deleted_at IS NULL` |

**Triggers:** `trg_transactions_updated_at`, `trg_savings_goal_transaction` (AFTER INSERT)

**RLS:** `ALL` — `uid = user_id AND deleted_at IS NULL`

⚠️ **Issue:** `savings_goal` trigger only fires on INSERT. Soft-deleting a linked transaction does NOT decrement `savings_goals.current_amount`. Handle in app layer.

---

### `transfers`

Records account-to-account money movements. Each transfer links two transaction rows — a debit (from_account) and a credit (to_account).

| Column                | Type        | Nullable | Default              | Notes                                 |
| --------------------- | ----------- | -------- | -------------------- | ------------------------------------- |
| `id` 🔑               | uuid        | NO       | `uuid_generate_v4()` |                                       |
| `user_id`             | uuid        | NO       | —                    | FK → `profiles.id` CASCADE            |
| `from_account_id`     | uuid        | NO       | —                    | FK → `accounts.id` RESTRICT           |
| `to_account_id`       | uuid        | NO       | —                    | FK → `accounts.id` RESTRICT           |
| `from_transaction_id` | uuid        | YES      | —                    | FK → `transactions.id` **CASCADE** ⚠️ |
| `to_transaction_id`   | uuid        | YES      | —                    | FK → `transactions.id` **CASCADE** ⚠️ |
| `amount`              | numeric     | NO       | —                    | Must be > 0                           |
| `note`                | text        | YES      | —                    |                                       |
| `date`                | date        | NO       | `CURRENT_DATE`       |                                       |
| `created_at`          | timestamptz | NO       | `now()`              |                                       |

**Check Constraint:** `from_account_id <> to_account_id`

**RLS:** `ALL` — `uid = user_id`

🔴 **Issue:** `from/to_transaction_id` ON DELETE CASCADE should be changed to SET NULL. If a transaction is ever hard-deleted, the transfer record silently disappears.

---

### `budgets`

Per-category or overall spending limits for weekly/monthly/yearly periods. `category_id = NULL` means the budget applies to all spending. Soft-deleted via `deleted_at`.

| Column        | Type        | Nullable | Default              | Notes                                                      |
| ------------- | ----------- | -------- | -------------------- | ---------------------------------------------------------- |
| `id` 🔑       | uuid        | NO       | `uuid_generate_v4()` |                                                            |
| `user_id`     | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                                 |
| `category_id` | uuid        | YES      | —                    | FK → `categories.id` **CASCADE** ⚠️. NULL = overall budget |
| `amount`      | numeric     | NO       | —                    | Must be > 0                                                |
| `period`      | text        | NO       | `'monthly'`          | `weekly` \| `monthly` \| `yearly`                          |
| `start_date`  | date        | NO       | —                    |                                                            |
| `end_date`    | date        | YES      | —                    | NULL = ongoing                                             |
| `is_active`   | boolean     | NO       | `true`               |                                                            |
| `created_at`  | timestamptz | NO       | `now()`              |                                                            |
| `updated_at`  | timestamptz | NO       | `now()`              |                                                            |
| `deleted_at`  | timestamptz | YES      | —                    | Soft delete                                                |

**Unique constraint:** `(user_id, category_id, period, start_date)`

**RLS:** `ALL` — `uid = user_id AND deleted_at IS NULL`

🔴 **Issue:** `category_id` ON DELETE CASCADE — deleting a category hard-deletes all its budgets. Should be SET NULL.

---

### `savings_goals`

Target-based savings tracker. `current_amount` is auto-incremented by a DB trigger when a transaction with `savings_goal_id` set is inserted. `is_achieved` is auto-set when target is reached.

| Column           | Type        | Nullable | Default              | Notes                                         |
| ---------------- | ----------- | -------- | -------------------- | --------------------------------------------- |
| `id` 🔑          | uuid        | NO       | `uuid_generate_v4()` |                                               |
| `user_id`        | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                    |
| `name`           | text        | NO       | —                    | e.g. "New iPhone", "Emergency Fund"           |
| `target_amount`  | numeric     | NO       | —                    | Must be > 0                                   |
| `current_amount` | numeric     | NO       | `0`                  | Auto-updated by trigger. Must be >= 0         |
| `deadline`       | date        | YES      | —                    | Optional target date                          |
| `icon`           | text        | YES      | —                    |                                               |
| `color`          | text        | YES      | —                    |                                               |
| `is_achieved`    | boolean     | NO       | `false`              | Auto-set when current_amount >= target_amount |
| `created_at`     | timestamptz | NO       | `now()`              |                                               |
| `updated_at`     | timestamptz | NO       | `now()`              |                                               |

**RLS:** `ALL` — `uid = user_id`

---

### `loans`

Full loan tracking. `next_emi_date` auto-advances after each payment via trigger. Links to an account for real-time balance monitoring and low-balance alerts before EMI day.

| Column                  | Type        | Nullable | Default              | Notes                                                                           |
| ----------------------- | ----------- | -------- | -------------------- | ------------------------------------------------------------------------------- |
| `id` 🔑                 | uuid        | NO       | `uuid_generate_v4()` |                                                                                 |
| `user_id`               | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                                                      |
| `account_id`            | uuid        | YES      | —                    | FK → `accounts.id` SET NULL. Linked bank account for EMI                        |
| `name`                  | text        | NO       | —                    | e.g. "Home Loan - SBI"                                                          |
| `lender_name`           | text        | YES      | —                    | Bank or person name                                                             |
| `loan_type`             | text        | NO       | —                    | `home` \| `car` \| `personal` \| `education` \| `business` \| `gold` \| `other` |
| `principal_amount`      | numeric     | NO       | —                    | Original loan amount. Must be > 0                                               |
| `outstanding_amount`    | numeric     | NO       | —                    | Current balance remaining. Auto-decremented by trigger                          |
| `interest_rate`         | numeric     | NO       | —                    | Annual % e.g. 8.5. Must be > 0                                                  |
| `interest_type`         | text        | NO       | —                    | `reducing` \| `flat`                                                            |
| `emi_amount`            | numeric     | NO       | —                    | Fixed monthly EMI. Must be > 0                                                  |
| `emi_day`               | smallint    | NO       | —                    | Day of month EMI is due (1–31)                                                  |
| `emi_reminder_days`     | smallint    | NO       | `2`                  | Notify X days before EMI                                                        |
| `low_balance_threshold` | numeric     | YES      | —                    | Alert if linked account balance < this before EMI                               |
| `tenure_months`         | integer     | NO       | —                    | Total loan duration in months. Must be > 0                                      |
| `months_paid`           | integer     | NO       | `0`                  | Auto-incremented by trigger after each payment                                  |
| `start_date`            | date        | NO       | —                    | Loan disbursement date                                                          |
| `end_date`              | date        | NO       | —                    | Scheduled last EMI date                                                         |
| `next_emi_date`         | date        | NO       | —                    | Auto-advances by 1 month after each payment                                     |
| `is_active`             | boolean     | NO       | `true`               | Auto-set false when outstanding_amount <= 0                                     |
| `notes`                 | text        | YES      | —                    |                                                                                 |
| `created_at`            | timestamptz | NO       | `now()`              |                                                                                 |
| `updated_at`            | timestamptz | NO       | `now()`              |                                                                                 |

**RLS:** `ALL` — `uid = user_id`

---

### `loan_payments`

Immutable ledger of every loan payment. Each insert triggers an update to the parent `loans` row. Supports 5 payment types.

| Column              | Type        | Nullable | Default              | Notes                                                             |
| ------------------- | ----------- | -------- | -------------------- | ----------------------------------------------------------------- |
| `id` 🔑             | uuid        | NO       | `uuid_generate_v4()` |                                                                   |
| `loan_id`           | uuid        | NO       | —                    | FK → `loans.id` CASCADE                                           |
| `user_id`           | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                                        |
| `transaction_id`    | uuid        | YES      | —                    | FK → `transactions.id` SET NULL. Optional linked transaction      |
| `payment_type`      | text        | NO       | —                    | `emi` \| `interest_only` \| `extra` \| `partial` \| `foreclosure` |
| `payment_date`      | date        | NO       | `CURRENT_DATE`       |                                                                   |
| `total_amount`      | numeric     | NO       | —                    | Total paid in this payment. Must be > 0                           |
| `principal_amount`  | numeric     | NO       | `0`                  | Portion going to principal reduction                              |
| `interest_amount`   | numeric     | NO       | `0`                  | Portion going to interest                                         |
| `extra_amount`      | numeric     | NO       | `0`                  | Amount above regular EMI (prepayment)                             |
| `outstanding_after` | numeric     | NO       | —                    | Remaining loan balance after this payment                         |
| `note`              | text        | YES      | —                    |                                                                   |
| `created_at`        | timestamptz | NO       | `now()`              |                                                                   |

**Payment type guide:**

| Type            | Use when                                         |
| --------------- | ------------------------------------------------ |
| `emi`           | Regular monthly EMI (principal + interest split) |
| `interest_only` | Paying only the interest portion this month      |
| `extra`         | Extra prepayment above regular EMI               |
| `partial`       | Paying less than full EMI                        |
| `foreclosure`   | Closing the entire loan at once                  |

**Trigger:** `trg_after_loan_payment` (AFTER INSERT) → `handle_loan_payment()` — updates `loans.outstanding_amount`, `months_paid`, `next_emi_date`, `is_active`

**RLS:** `ALL` — `uid = user_id`

⚠️ **Issue:** No `is_reversed` flag — incorrect payments have no correction path.

---

### `debts`

Track informal money owed to/from people. `is_settled` + `settled_at` record resolution.

| Column        | Type        | Nullable | Default              | Notes                       |
| ------------- | ----------- | -------- | -------------------- | --------------------------- |
| `id` 🔑       | uuid        | NO       | `uuid_generate_v4()` |                             |
| `user_id`     | uuid        | NO       | —                    | FK → `profiles.id` CASCADE  |
| `person_name` | text        | NO       | —                    |                             |
| `amount`      | numeric     | NO       | —                    | Must be > 0                 |
| `type`        | text        | NO       | —                    | `i_owe` \| `they_owe`       |
| `note`        | text        | YES      | —                    |                             |
| `due_date`    | date        | YES      | —                    | Optional repayment deadline |
| `is_settled`  | boolean     | NO       | `false`              |                             |
| `settled_at`  | timestamptz | YES      | —                    | When it was settled         |
| `created_at`  | timestamptz | NO       | `now()`              |                             |
| `updated_at`  | timestamptz | NO       | `now()`              |                             |

**RLS:** `ALL` — `uid = user_id`

⚠️ **Issue:** No `transaction_id` FK — settling a debt cannot be linked to the actual payment transaction.

---

### `subscriptions`

Dedicated subscription tracker. Separate from `recurring_rules` — focused on services with named billing cycles and renewal tracking. `last_used_date` enables unused-subscription detection.

| Column              | Type        | Nullable | Default              | Notes                                            |
| ------------------- | ----------- | -------- | -------------------- | ------------------------------------------------ |
| `id` 🔑             | uuid        | NO       | `uuid_generate_v4()` |                                                  |
| `user_id`           | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                       |
| `account_id`        | uuid        | YES      | —                    | FK → `accounts.id` SET NULL                      |
| `category_id`       | uuid        | YES      | —                    | FK → `categories.id` SET NULL                    |
| `name`              | text        | NO       | —                    | e.g. "Netflix", "Spotify"                        |
| `amount`            | numeric     | NO       | —                    | Must be > 0                                      |
| `billing_cycle`     | text        | NO       | —                    | `weekly` \| `monthly` \| `quarterly` \| `yearly` |
| `next_renewal_date` | date        | NO       | —                    | App updates this after each renewal              |
| `last_used_date`    | date        | YES      | —                    | Update when user uses the service                |
| `reminder_days`     | smallint    | NO       | `3`                  | Notify X days before renewal                     |
| `url`               | text        | YES      | —                    | Service website                                  |
| `notes`             | text        | YES      | —                    |                                                  |
| `is_active`         | boolean     | NO       | `true`               |                                                  |
| `created_at`        | timestamptz | NO       | `now()`              |                                                  |
| `updated_at`        | timestamptz | NO       | `now()`              |                                                  |

**RLS:** `ALL` — `uid = user_id`

---

### `projects`

Group transactions under a named project or event. Optional project budget. Transactions link via `project_id`. Useful for trip planning, event budgeting, or large purchase tracking.

| Column       | Type        | Nullable | Default              | Notes                         |
| ------------ | ----------- | -------- | -------------------- | ----------------------------- |
| `id` 🔑      | uuid        | NO       | `uuid_generate_v4()` |                               |
| `user_id`    | uuid        | NO       | —                    | FK → `profiles.id` CASCADE    |
| `name`       | text        | NO       | —                    | e.g. "Goa Trip 2026"          |
| `icon`       | text        | YES      | —                    |                               |
| `color`      | text        | YES      | —                    |                               |
| `budget`     | numeric     | YES      | —                    | Optional project spending cap |
| `start_date` | date        | YES      | —                    |                               |
| `end_date`   | date        | YES      | —                    |                               |
| `is_active`  | boolean     | NO       | `true`               |                               |
| `notes`      | text        | YES      | —                    |                               |
| `created_at` | timestamptz | NO       | `now()`              |                               |
| `updated_at` | timestamptz | NO       | `now()`              |                               |

**RLS:** `ALL` — `uid = user_id`

---

### `notification_settings`

One row per user. Auto-created when a `profiles` row is inserted. All notifications default to enabled. Users toggle preferences here.

| Column                     | Type        | Default              | Notes                                       |
| -------------------------- | ----------- | -------------------- | ------------------------------------------- |
| `id` 🔑                    | uuid        | `uuid_generate_v4()` |                                             |
| `user_id`                  | uuid        | —                    | FK → `profiles.id` CASCADE. UNIQUE          |
| `emi_reminder`             | boolean     | `true`               | Enable EMI due reminders                    |
| `emi_reminder_days`        | smallint    | `2`                  | Days before EMI to notify                   |
| `low_balance_alert`        | boolean     | `true`               | Alert when account balance < threshold      |
| `budget_alert`             | boolean     | `true`               | Alert when budget % is reached              |
| `budget_alert_threshold`   | smallint    | `80`                 | % of budget used before alert fires         |
| `large_transaction_alert`  | boolean     | `true`               | Alert on single large transactions          |
| `large_transaction_amount` | numeric     | `5000`               | Threshold for large transaction alert       |
| `recurring_reminder`       | boolean     | `true`               | Remind before recurring transaction is due  |
| `recurring_reminder_days`  | smallint    | `1`                  | Days before recurring due date              |
| `debt_reminder`            | boolean     | `true`               | Remind about unsettled debts with due dates |
| `debt_reminder_days`       | smallint    | `3`                  | Days before debt due date                   |
| `savings_milestone_alert`  | boolean     | `true`               | Alert at 25/50/75/100% of savings goal      |
| `loan_milestone_alert`     | boolean     | `true`               | Alert at 25/50/75% of loan paid off         |
| `weekly_digest`            | boolean     | `true`               | Weekly summary notification                 |
| `monthly_report`           | boolean     | `true`               | Monthly report notification                 |
| `daily_limit_alert`        | boolean     | `true`               | Alert when daily_limit is exceeded          |
| `created_at`               | timestamptz | `now()`              |                                             |
| `updated_at`               | timestamptz | `now()`              |                                             |

**Unique:** `(user_id)`  
**RLS:** `ALL` — `uid = user_id`

---

### `net_worth_snapshots`

Monthly point-in-time snapshots of user's financial position. `net_worth` is a generated stored column computed as `total_assets - total_debts`. Use these rows to draw a wealth timeline chart over months/years.

| Column          | Type        | Nullable | Default              | Notes                                             |
| --------------- | ----------- | -------- | -------------------- | ------------------------------------------------- |
| `id` 🔑         | uuid        | NO       | `uuid_generate_v4()` |                                                   |
| `user_id`       | uuid        | NO       | —                    | FK → `profiles.id` CASCADE                        |
| `snapshot_date` | date        | NO       | `CURRENT_DATE`       | One snapshot per month recommended                |
| `total_assets`  | numeric     | NO       | `0`                  | Sum of all account balances                       |
| `total_debts`   | numeric     | NO       | `0`                  | Sum of all outstanding loan amounts               |
| `net_worth`     | numeric     | YES      | —                    | **GENERATED** `total_assets - total_debts` STORED |
| `notes`         | text        | YES      | —                    |                                                   |
| `created_at`    | timestamptz | NO       | `now()`              |                                                   |

**Unique:** `(user_id, snapshot_date)`  
**RLS:** `ALL` — `uid = user_id`

---

### `wishlist`

Future purchase tracker. Optional link to a `savings_goals` row to track saving toward a specific item. `is_purchased` + `purchased_at` record fulfilment.

| Column            | Type        | Nullable | Default              | Notes                            |
| ----------------- | ----------- | -------- | -------------------- | -------------------------------- |
| `id` 🔑           | uuid        | NO       | `uuid_generate_v4()` |                                  |
| `user_id`         | uuid        | NO       | —                    | FK → `profiles.id` CASCADE       |
| `savings_goal_id` | uuid        | YES      | —                    | FK → `savings_goals.id` SET NULL |
| `name`            | text        | NO       | —                    | e.g. "MacBook Pro M4"            |
| `amount`          | numeric     | NO       | —                    | Expected price. Must be > 0      |
| `priority`        | text        | NO       | `'medium'`           | `low` \| `medium` \| `high`      |
| `target_date`     | date        | YES      | —                    | Desired purchase date            |
| `url`             | text        | YES      | —                    | Product link                     |
| `notes`           | text        | YES      | —                    |                                  |
| `is_purchased`    | boolean     | NO       | `false`              |                                  |
| `purchased_at`    | date        | YES      | —                    | Actual purchase date             |
| `created_at`      | timestamptz | NO       | `now()`              |                                  |
| `updated_at`      | timestamptz | NO       | `now()`              |                                  |

**RLS:** `ALL` — `uid = user_id`

---

## Views

All views use `WITH (security_invoker = TRUE)` so they respect the calling user's RLS policies automatically.

---

### `loan_analytics`

Full per-loan analytics view joining `loans`, `loan_payments`, and `accounts`.

**Key output fields:**

| Field                        | Description                                               |
| ---------------------------- | --------------------------------------------------------- |
| `total_payable`              | `emi_amount × tenure_months` — total if no prepayments    |
| `total_interest`             | `total_payable − principal_amount`                        |
| `total_paid_so_far`          | Sum of all payment amounts                                |
| `principal_paid`             | Sum of principal portions paid                            |
| `interest_paid`              | Sum of interest portions paid                             |
| `extra_paid`                 | Sum of extra prepayments                                  |
| `percent_paid`               | `(principal − outstanding) / principal × 100`             |
| `months_remaining`           | `tenure_months − months_paid`                             |
| `estimated_months_to_finish` | Recalculated based on current outstanding + interest rate |
| `projected_finish_date`      | `CURRENT_DATE + estimated_months_to_finish`               |
| `low_balance_alert`          | `TRUE` if `account.balance < low_balance_threshold`       |
| `linked_account_balance`     | Live balance of connected account                         |

**Usage:**

```sql
SELECT * FROM loan_analytics WHERE user_id = auth.uid();
```

---

### `emi_reminders`

Surfaces loans with EMI due within `emi_reminder_days` from today. Used to drive push notifications.

**Key output fields:**

| Field                  | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `days_until_emi`       | `next_emi_date − CURRENT_DATE`                      |
| `insufficient_balance` | `TRUE` if `account_balance < emi_amount`            |
| `low_balance_warning`  | `TRUE` if `account_balance < low_balance_threshold` |

**Usage:**

```sql
SELECT * FROM emi_reminders WHERE user_id = auth.uid();
```

---

### `financial_health`

Computes a 0–100 financial health score for each user using this month's data.

**Scoring breakdown (25 pts each):**

| Component              | How it's calculated                                              |
| ---------------------- | ---------------------------------------------------------------- |
| `savings_rate_score`   | `(income − expense) / income`. Full 25 pts at ≥ 20% savings rate |
| `budget_score`         | Ratio of active budgets not exceeded this month                  |
| `debt_score`           | Lower `total_emi / monthly_income` ratio = higher score          |
| `emergency_fund_score` | Full 25 pts when savings cover 3+ months of expenses             |

**Usage:**

```sql
SELECT total_score, savings_rate_score, budget_score, debt_score, emergency_fund_score
FROM financial_health WHERE user_id = auth.uid();
```

---

## Functions & Triggers

| Function                             | Security | Called By                                                     | Description                                                                          |
| ------------------------------------ | -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `handle_updated_at()`                | INVOKER  | 12 UPDATE triggers                                            | Sets `updated_at = NOW()` on every row update                                        |
| `handle_new_user()`                  | DEFINER  | `trg_on_auth_user_created` on `auth.users`                    | Auto-creates `profiles` row on signup. EXECUTE revoked from `anon` + `authenticated` |
| `handle_new_profile_notifications()` | INVOKER  | `trg_new_profile_notifications` on `profiles`                 | Auto-creates `notification_settings` row when profile is created                     |
| `handle_first_account_default()`     | INVOKER  | `trg_first_account_default` BEFORE INSERT on `accounts`       | If user has no other accounts, sets `is_default = TRUE` automatically                |
| `handle_account_default_update()`    | INVOKER  | `trg_account_default_update` BEFORE UPDATE on `accounts`      | Prevents unsetting the only default account; raises exception with clear message     |
| `handle_savings_goal_transaction()`  | INVOKER  | `trg_savings_goal_transaction` AFTER INSERT on `transactions` | Increments `savings_goals.current_amount`; sets `is_achieved = TRUE` if target met   |
| `handle_loan_payment()`              | INVOKER  | `trg_after_loan_payment` AFTER INSERT on `loan_payments`      | Updates `loans.outstanding_amount`, `months_paid`, `next_emi_date`, `is_active`      |

All functions have `SET search_path = public` to prevent search path injection attacks.

---

## RLS Policies

| Table                   | Policy                         | Command | Expression                                                  |
| ----------------------- | ------------------------------ | ------- | ----------------------------------------------------------- |
| `profiles`              | profiles: own row              | ALL     | `(SELECT auth.uid()) = id`                                  |
| `categories`            | select own and defaults        | SELECT  | `deleted_at IS NULL AND (user_id IS NULL OR uid = user_id)` |
| `categories`            | insert own                     | INSERT  | `uid = user_id`                                             |
| `categories`            | update own                     | UPDATE  | `uid = user_id`                                             |
| `categories`            | delete own                     | DELETE  | `uid = user_id`                                             |
| `accounts`              | accounts: own rows             | ALL     | `uid = user_id AND deleted_at IS NULL`                      |
| `transactions`          | transactions: own rows         | ALL     | `uid = user_id AND deleted_at IS NULL`                      |
| `transfers`             | transfers: own rows            | ALL     | `uid = user_id`                                             |
| `budgets`               | budgets: own rows              | ALL     | `uid = user_id AND deleted_at IS NULL`                      |
| `recurring_rules`       | recurring_rules: own rows      | ALL     | `uid = user_id`                                             |
| `savings_goals`         | savings_goals: own rows        | ALL     | `uid = user_id`                                             |
| `loans`                 | loans: own rows                | ALL     | `uid = user_id`                                             |
| `loan_payments`         | loan_payments: own rows        | ALL     | `uid = user_id`                                             |
| `debts`                 | debts: own rows                | ALL     | `uid = user_id`                                             |
| `subscriptions`         | subscriptions: own rows        | ALL     | `uid = user_id`                                             |
| `projects`              | projects: own rows             | ALL     | `uid = user_id`                                             |
| `notification_settings` | notification_settings: own row | ALL     | `uid = user_id`                                             |
| `net_worth_snapshots`   | net_worth_snapshots: own rows  | ALL     | `uid = user_id`                                             |
| `wishlist`              | wishlist: own rows             | ALL     | `uid = user_id`                                             |

> All policies use `(SELECT auth.uid())` — evaluated **once per query**, not once per row, for optimal performance.

---

## Indexes

**Total: 57 indexes across 16 tables**

Notable index patterns:

**Partial indexes** (filter `deleted_at IS NULL`) — used by the 4 soft-delete tables for efficient live-data queries:

- `idx_accounts_user_active`
- `idx_categories_user_active`
- `idx_budgets_user_category`
- `idx_transactions_user_date`
- `idx_transactions_user_type`
- `idx_transactions_user_category_date`

**Partial unique index** (enforces one default account per user):

- `idx_accounts_one_default_per_user` — `UNIQUE (user_id) WHERE is_default = TRUE`

**Composite indexes** for common multi-column query patterns:

- `idx_transactions_user_date` — `(user_id, date DESC)`
- `idx_transactions_user_type` — `(user_id, type)`
- `idx_transactions_user_category_date` — `(user_id, category_id, date)`
- `idx_budgets_user_category` — `(user_id, category_id)`
- `idx_net_worth_snapshots_user_date` — `(user_id, snapshot_date DESC)`

> **Note:** Supabase performance advisor flags all indexes as "unused" on an empty database. This is expected — these indexes are correctly designed and will be used in production once data is present. Do not drop them.

---

## Known Issues & Recommended Fixes

### 🔴 High Priority

**1. `transfers.from_transaction_id` and `to_transaction_id` — ON DELETE CASCADE should be SET NULL**

If a transaction linked to a transfer is ever hard-deleted, the transfer record silently vanishes. Since transactions use soft-delete this is safe for now, but a schema-level guarantee is better.

```sql
ALTER TABLE public.transfers
  DROP CONSTRAINT transfers_from_transaction_id_fkey,
  DROP CONSTRAINT transfers_to_transaction_id_fkey,
  ADD CONSTRAINT transfers_from_transaction_id_fkey
    FOREIGN KEY (from_transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL,
  ADD CONSTRAINT transfers_to_transaction_id_fkey
    FOREIGN KEY (to_transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;
```

**2. `budgets.category_id` — ON DELETE CASCADE should be SET NULL**

Deleting a category currently hard-deletes all associated budgets, destroying historical budget data.

```sql
ALTER TABLE public.budgets
  DROP CONSTRAINT budgets_category_id_fkey,
  ADD CONSTRAINT budgets_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
```

---

### 🟡 Medium Priority

**3. `categories` — Add `updated_at` column**

```sql
ALTER TABLE public.categories ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**4. `debts` — Add optional `transaction_id` FK**

```sql
ALTER TABLE public.debts
  ADD COLUMN transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL;
```

**5. `loan_payments` — Add `is_reversed` flag**

```sql
ALTER TABLE public.loan_payments
  ADD COLUMN is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN reversed_at TIMESTAMPTZ;
```

**6. App layer: never hard-delete accounts**

Enforce in app code that accounts are always soft-deleted (`deleted_at = NOW()`), never hard-deleted. Transactions hold a RESTRICT FK, so hard deletes will fail anyway — but the app should handle this gracefully.

**7. Savings goal `current_amount` drift on soft-delete**

When a transaction linked to a savings goal is soft-deleted, `current_amount` is NOT decremented. Add a recalculation function or handle in app layer:

```sql
UPDATE savings_goals SET current_amount = (
  SELECT COALESCE(SUM(amount), 0) FROM transactions
  WHERE savings_goal_id = savings_goals.id AND deleted_at IS NULL
) WHERE id = $goal_id;
```

---

### 🟢 Low Priority

**8. `profiles` — Consider re-adding `currency_code`**

`currency_code` was removed from `accounts`. If multi-currency display is ever needed, a home currency preference on `profiles` is the right place.

**9. `transfers` — Consider adding `updated_at` and soft-delete**

Currently transfers are fully immutable. If reversal or amendment is ever needed, `updated_at` and `deleted_at` would be needed.

---

## Soft Delete Strategy

Four tables use soft delete. The pattern is consistent across all of them:

| Aspect      | Implementation                                                                       |
| ----------- | ------------------------------------------------------------------------------------ |
| Column      | `deleted_at TIMESTAMPTZ NULL` — NULL means active                                    |
| Soft-delete | `UPDATE table SET deleted_at = NOW() WHERE id = $id`                                 |
| Hard-delete | **Never** for `accounts` and `transactions` (FK constraints)                         |
| RLS         | Policies include `AND deleted_at IS NULL` — soft-deleted rows are invisible to users |
| Indexes     | Partial indexes on `WHERE deleted_at IS NULL` for performance                        |
| Restore     | `UPDATE table SET deleted_at = NULL WHERE id = $id`                                  |

---

## Query Examples

### Dashboard — total balance

```sql
SELECT SUM(balance) AS total_balance
FROM accounts
WHERE user_id = auth.uid() AND is_active = TRUE;
-- deleted_at IS NULL handled by RLS
```

### This month income vs expense

```sql
SELECT type, SUM(amount) AS total
FROM transactions
WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
GROUP BY type;
-- user_id and deleted_at IS NULL handled by RLS
```

### Top spending categories this month

```sql
SELECT c.name, c.icon, c.color, SUM(t.amount) AS total
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense'
  AND date_trunc('month', t.date) = date_trunc('month', CURRENT_DATE)
GROUP BY c.id, c.name, c.icon, c.color
ORDER BY total DESC
LIMIT 5;
```

### Budget usage this month

```sql
SELECT
  c.name AS category,
  b.amount AS budget,
  COALESCE(SUM(t.amount), 0) AS spent,
  ROUND(COALESCE(SUM(t.amount), 0) / b.amount * 100, 1) AS pct_used
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = b.category_id
  AND date_trunc('month', t.date) = date_trunc('month', CURRENT_DATE)
  AND t.type = 'expense'
WHERE b.is_active = TRUE
GROUP BY c.name, b.amount
ORDER BY pct_used DESC;
```

### EMI reminders (next 2 days)

```sql
SELECT * FROM emi_reminders;
-- view already filters by emi_reminder_days
```

### Loan analytics

```sql
SELECT name, percent_paid, projected_finish_date,
       total_interest, extra_paid, low_balance_alert
FROM loan_analytics;
```

### Financial health score

```sql
SELECT total_score, savings_rate_score, budget_score,
       debt_score, emergency_fund_score
FROM financial_health;
```

### Monthly spending trend (last 6 months)

```sql
SELECT date_trunc('month', date) AS month, SUM(amount) AS total
FROM transactions
WHERE type = 'expense'
  AND date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY month
ORDER BY month;
```

### Subscriptions unused for 30+ days

```sql
SELECT name, amount, billing_cycle, last_used_date,
       CURRENT_DATE - last_used_date AS days_unused
FROM subscriptions
WHERE is_active = TRUE
  AND last_used_date < CURRENT_DATE - INTERVAL '30 days'
ORDER BY days_unused DESC;
```

### Net worth over time

```sql
SELECT snapshot_date, total_assets, total_debts, net_worth
FROM net_worth_snapshots
ORDER BY snapshot_date DESC;
```

### Project spend vs budget

```sql
SELECT p.name, p.budget,
       COALESCE(SUM(t.amount), 0) AS spent,
       p.budget - COALESCE(SUM(t.amount), 0) AS remaining
FROM projects p
LEFT JOIN transactions t ON t.project_id = p.id AND t.type = 'expense'
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.budget;
```

---

_Generated from live Supabase schema on 2026-05-10. Security advisors: 0. Performance advisors: 0._
