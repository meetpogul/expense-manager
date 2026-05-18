/**
 * Public API surface for the transactions feature.
 *
 * Server-side modules (server/actions, server/queries, server/mutations) are
 * intentionally excluded — import those directly from their file paths to
 * keep the "use server" / server-only boundary explicit.
 */

// Domain — types
export type {
  Transaction,
  TransactionType,
  DashboardSummary,
} from "./domain/types";

// Domain — schema + inferred types
export {
  transactionFormSchema,
  amountFromForm,
  optionalTextFromForm,
  dateFromForm,
} from "./domain/transaction.schema";
export type {
  TransactionFormValues,
  TransactionInput,
} from "./domain/transaction.schema";

// Domain — constants
export {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  DEFAULT_TRANSACTION_LIMIT,
  DASHBOARD_TRANSACTION_LIMIT,
} from "./domain/constants";

// Domain — formatters
export {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatTransactionGroupDate,
  todayInputValue,
  currencyFormatter,
  compactCurrencyFormatter,
} from "./domain/format";

// Domain — balance helpers
export {
  transactionEffect,
  reversalEffect,
  nextBalance,
  editBalanceDelta,
} from "./domain/balance";

// Hooks
export { parseTransactionFilters } from "./hooks/use-transaction-filters";
export type { TransactionFilters } from "./hooks/use-transaction-filters";

// Components
export { TransactionForm } from "./components/transaction-form";
export { TransactionList } from "./components/transaction-list";
export { TransactionFilters as TransactionFiltersForm } from "./components/transaction-filters";
