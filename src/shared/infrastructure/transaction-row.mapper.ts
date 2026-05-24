/**
 * Shared infrastructure mapper re-export.
 *
 * `recurring/` needs `rowFromNewTransaction` but should not reach into
 * `transactions/infrastructure/`. This re-export provides a stable shared path.
 */
export {
  rowFromNewTransaction,
  rowFromTransactionChanges,
  mutationTransactionFromRow,
} from "@/features/transactions/infrastructure/transaction-row.mapper";
