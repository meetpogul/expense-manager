/**
 * Public API surface for the accounts feature.
 *
 * Server-side modules (server/actions, server/queries) are intentionally
 * excluded — import those directly from their file paths to keep the
 * "use server" / server-only boundary explicit.
 */

// Domain — types
export type { Account, AccountType } from "./domain/types";

// Domain — schema + inferred types
export { accountFormSchema } from "./domain/account.schema";
export type { AccountFormValues, AccountInput } from "./domain/account.schema";

// Domain — constants
export {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  DEFAULT_ACCOUNT_TYPE,
} from "./domain/constants";

// Components
export { AccountForm } from "./components/account-form";
