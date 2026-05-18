import type { BudgetInput } from "../../domain/budget.schema";
import type { BudgetRepository } from "../ports";

export class UpdateBudgetUseCase {
  constructor(private readonly repository: BudgetRepository) {}

  execute(budgetId: string, input: BudgetInput) {
    return this.repository.update(budgetId, input);
  }
}
