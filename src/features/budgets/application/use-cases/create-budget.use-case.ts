import type { BudgetInput } from "../../domain/budget.schema";
import type { BudgetRepository } from "../ports";

export class CreateBudgetUseCase {
  constructor(private readonly repository: BudgetRepository) {}

  execute(input: BudgetInput, userId: string) {
    return this.repository.create({ ...input, userId });
  }
}
