/**
 * Dashboard domain types.
 *
 * Moved from `transactions/domain/types.ts` per the architecture roadmap
 * (Phase 2: expand dashboard to a first-class feature).
 * The original location re-exports this type for backward compatibility.
 */

export type DashboardSummary = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
};
