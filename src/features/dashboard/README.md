# Feature: Dashboard (Planned)

## Purpose

The dashboard is an **aggregate read feature** — it does not own any data but assembles summary views from the `transactions`, `accounts`, and `categories` features for quick financial insight.

## Architecture

```
dashboard/
├── components/        # Business UI components
│   └── summary-card.tsx    # Financial summary card (income/expense/balance tones)
├── domain/            # (future) DashboardSummary type, period helpers
├── hooks/             # (future) useDashboardDateRange, etc.
├── server/            # (future) getDashboardSummary aggregate query
└── README.md
```

## Planned Data Flow

```
Dashboard Page (RSC)
  ├─ getAccounts(supabase)                         ← accounts/server/queries
  ├─ getTransactions(supabase, { limit: 6 })       ← transactions/server/queries
  └─ getDashboardSummary(accounts, transactions)   ← dashboard/server/queries (future)
```

## Notes

- `getDashboardSummary` currently lives in `transactions/server/queries.ts` since the dashboard is not yet its own feature.
- When the dashboard expands (charts, period selectors, budget vs actual), move the summary logic here.
- Future modules: `features/budgets`, `features/goals`, `features/recurring` — these will all feed dashboard widgets.
