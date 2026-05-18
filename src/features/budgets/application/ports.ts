import type { BudgetInput } from "../domain/budget.schema";

export type BudgetRepository = {
  create(input: BudgetInput & { userId: string }): Promise<void>;
  update(budgetId: string, input: BudgetInput): Promise<void>;
  setActive(budgetId: string, isActive: boolean): Promise<void>;
  softDelete(budgetId: string, deletedAt: string): Promise<void>;
};
