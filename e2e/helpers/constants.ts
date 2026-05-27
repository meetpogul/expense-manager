export const TEST_PREFIX = "E2E-TEST-";

export const TEST_ACCOUNT = {
  name: `${TEST_PREFIX}Account`,
  type: "bank" as const,
  balance: "5000",
};

export const TEST_ACCOUNT_2 = {
  name: `${TEST_PREFIX}Account-2`,
  type: "cash" as const,
  balance: "1000",
};

export const TEST_CATEGORY = {
  name: `${TEST_PREFIX}Category`,
  icon: "E2",
  type: "expense" as const,
};

export const TEST_CATEGORY_BOTH = {
  name: `${TEST_PREFIX}Category-Both`,
  icon: "EB",
  type: "both" as const,
};

export const TEST_EXPENSE = {
  amount: "1500",
  merchant: `${TEST_PREFIX}Merchant`,
  note: `${TEST_PREFIX}Note-Expense`,
};

export const TEST_INCOME = {
  amount: "5000",
  merchant: `${TEST_PREFIX}Merchant-Income`,
  note: `${TEST_PREFIX}Note-Income`,
};

export const TEST_BUDGET = {
  amount: "10000",
  period: "monthly" as const,
};

export const TEST_RECURRING = {
  amount: "2000",
  note: "E2E-TEST-Recurring-Note",
  frequency: "monthly" as const,
};

export const ROUTES = {
  dashboard: "/",
  login: "/auth/login",
  accounts: "/accounts",
  categories: "/categories",
  transactions: "/transactions",
  budgets: "/budgets",
  recurring: "/recurring",
  settings: "/settings",
} as const;

export const SELECTORS = {
  submitButton: "button[type='submit']",
  successMessage: "text=Saved. || text=Updated. || text=Transaction saved.",
  errorMessage: "[role='alert'], form > p",
};
