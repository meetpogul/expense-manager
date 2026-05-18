import type { BudgetRepository } from "../ports";

export class SetBudgetActiveUseCase {
  constructor(private readonly repository: BudgetRepository) {}

  execute(budgetId: string, isActive: boolean) {
    return this.repository.setActive(budgetId, isActive);
  }
}
