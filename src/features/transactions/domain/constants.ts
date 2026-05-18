/**
 * Canonical constants for the transactions domain.
 * Import from here instead of redeclaring inline strings.
 */

export const TRANSACTION_TYPES = ["expense", "income"] as const;

export const TRANSACTION_TYPE_LABELS: Record<
  (typeof TRANSACTION_TYPES)[number],
  string
> = {
  expense: "Expense",
  income: "Income",
};

/** Default number of transactions fetched for list views. */
export const DEFAULT_TRANSACTION_LIMIT = 50;

/** Number of recent transactions shown on the dashboard. */
export const DASHBOARD_TRANSACTION_LIMIT = 6;
