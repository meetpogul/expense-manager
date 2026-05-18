import type { RecurringRuleInput } from "../../domain/recurring.schema";
import type { RecurringRuleRepository } from "../ports";

export class CreateRecurringRuleUseCase {
  constructor(private readonly repository: RecurringRuleRepository) {}

  execute(input: RecurringRuleInput, userId: string) {
    return this.repository.create({ ...input, userId });
  }
}
