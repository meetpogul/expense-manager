import type { RecurringRuleInput } from "../domain/recurring.schema";
import type { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import type { Money } from "@/shared/domain/value-objects";
import type { NewTransaction } from "@/features/transactions/application/records";
import type { RecurringFrequency } from "../domain/types";

export type RecurringRuleRepository = {
  create(input: RecurringRuleInput & { userId: string }): Promise<void>;
  update(ruleId: string, input: RecurringRuleInput): Promise<void>;
  deactivate(ruleId: string): Promise<void>;
};

export type RecurringExecutionRule = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: "expense" | "income";
  amount: number;
  note: string | null;
  frequency: RecurringFrequency;
  next_due_date: string;
  end_date: string | null;
  is_active: boolean;
};

export type RecurringExecutionRepository = {
  getExecutionRule(ruleId: string): Promise<RecurringExecutionRule>;
  hasTransactionForRuleDate(ruleId: string, date: string): Promise<boolean>;
  insertTransaction(transaction: NewTransaction): Promise<{ id: string }>;
  softDeleteTransaction(
    transactionId: string,
    deletedAt: string,
  ): Promise<void>;
  getAccountBalance(accountId: AccountId): Promise<Money>;
  setAccountBalance(accountId: AccountId, balance: Money): Promise<void>;
  updateExecutionState(
    ruleId: string,
    state: { isActive: boolean; nextDueDate: string },
  ): Promise<void>;
};
