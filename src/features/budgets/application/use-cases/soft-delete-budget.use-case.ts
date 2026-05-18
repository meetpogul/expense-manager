import type { BudgetRepository } from "../ports";

export class SoftDeleteBudgetUseCase {
  constructor(private readonly repository: BudgetRepository) {}

  execute(budgetId: string, deletedAt: string) {
    return this.repository.softDelete(budgetId, deletedAt);
  }
}
