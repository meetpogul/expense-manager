/**
 * Canonical constants for the categories domain.
 * Import from here instead of redeclaring inline strings.
 */

export const CATEGORY_TYPES = ["expense", "income", "both"] as const;

export const CATEGORY_TYPE_LABELS: Record<
  (typeof CATEGORY_TYPES)[number],
  string
> = {
  expense: "Expense",
  income: "Income",
  both: "Both",
};

/**
 * Name of the system default category used as the pre-selected option
 * in the transaction form for expense transactions.
 */
export const DEFAULT_EXPENSE_CATEGORY_NAME = "Food & Dining";
