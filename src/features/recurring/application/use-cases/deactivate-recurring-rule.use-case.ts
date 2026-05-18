import type { RecurringRuleRepository } from "../ports";

export class DeactivateRecurringRuleUseCase {
  constructor(private readonly repository: RecurringRuleRepository) {}

  execute(ruleId: string) {
    return this.repository.deactivate(ruleId);
  }
}
