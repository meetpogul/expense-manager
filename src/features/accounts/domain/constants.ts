/**
 * Canonical constants for the accounts domain.
 * Import from here instead of redeclaring inline strings.
 */

export const ACCOUNT_TYPES = [
  "cash",
  "bank",
  "credit_card",
  "upi",
  "wallet",
  "other",
] as const;

export const ACCOUNT_TYPE_LABELS: Record<
  (typeof ACCOUNT_TYPES)[number],
  string
> = {
  cash: "Cash",
  bank: "Bank",
  credit_card: "Credit card",
  upi: "UPI",
  wallet: "Wallet",
  other: "Other",
};

/** Default account type pre-selected in the account form. */
export const DEFAULT_ACCOUNT_TYPE = "bank" as const;
