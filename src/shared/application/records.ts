/**
 * Shared persistence record types used across bounded contexts.
 *
 * These types represent the raw data shape passed to the database layer
 * and are intentionally thin — no domain logic, no validation.
 */
export type {
  NewTransaction,
  TransactionChanges,
  TransactionRecord,
} from "@/features/transactions/application/records";
