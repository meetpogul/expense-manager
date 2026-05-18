import type { RecurringRuleInput } from "../../domain/recurring.schema";
import type { RecurringRuleRepository } from "../ports";

export class UpdateRecurringRuleUseCase {
  constructor(private readonly repository: RecurringRuleRepository) {}

  execute(ruleId: string, input: RecurringRuleInput) {
    return this.repository.update(ruleId, input);
  }
}
