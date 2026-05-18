export const APP_ROUTES = {
  accounts: "/accounts",
  budgets: "/budgets",
  categories: "/categories",
  dashboard: "/",
  login: "/auth/login",
  recurring: "/recurring",
  settings: "/settings",
  transactions: "/transactions",
} as const;

export const FINANCE_REVALIDATION_PATHS = [
  APP_ROUTES.dashboard,
  APP_ROUTES.transactions,
  APP_ROUTES.accounts,
  APP_ROUTES.budgets,
  APP_ROUTES.recurring,
  APP_ROUTES.categories,
] as const;
