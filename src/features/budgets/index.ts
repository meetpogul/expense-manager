/**
 * Public API surface for the budgets feature.
 *
 * Server-side modules are intentionally excluded. Import server actions and
 * queries directly from their files to keep server boundaries explicit.
 */

export type {
  Budget,
  BudgetDetail,
  BudgetPeriod,
  BudgetPeriodWindow,
  BudgetStatus,
  BudgetUsage,
  BudgetWithUsage,
} from "./domain/types";

export { budgetFormSchema } from "./domain/budget.schema";
export type { BudgetFormValues, BudgetInput } from "./domain/budget.schema";

export {
  BUDGET_ALERT_THRESHOLD,
  BUDGET_PERIOD_LABELS,
  BUDGET_PERIODS,
  BUDGET_STATUS_LABELS,
  BUDGET_WARNING_THRESHOLD,
} from "./domain/constants";

export {
  calculateBudgetUsage,
  clampProgressPercent,
  getBudgetPeriodWindow,
  getBudgetStatus,
  sortBudgetsForAttention,
  transactionAppliesToBudget,
} from "./domain/usage";

export { BudgetDetail as BudgetDetailView } from "./components/budget-detail";
export { BudgetForm } from "./components/budget-form";
export { BudgetList } from "./components/budget-list";
