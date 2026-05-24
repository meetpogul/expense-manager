/**
 * Public API surface for the recurring feature.
 *
 * Server-side modules are intentionally excluded. Import server actions and
 * queries directly from their files to keep server boundaries explicit.
 */

export type { RecurringFrequency, RecurringRule } from "./domain/types";

export { recurringRuleFormSchema } from "./domain/recurring.schema";
export type {
  RecurringRuleFormValues,
  RecurringRuleInput,
} from "./domain/recurring.schema";

export {
  RECURRING_FREQUENCIES,
  RECURRING_FREQUENCY_LABELS,
} from "./domain/constants";

export {
  advanceRecurringDueDate,
  isRecurringRuleActiveAfterAdvance,
  isRecurringRuleDue,
} from "./domain/schedule";

export {
  RecurringRuleForm,
  RecurringRuleFormContainer,
} from "./components/recurring-rule-form";
export { RecurringRuleList } from "./components/recurring-rule-list";
