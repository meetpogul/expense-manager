import { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import { transactionEffect } from "@/features/transactions/domain/balance";
import { Money } from "@/shared/domain/value-objects";

import {
  advanceRecurringDueDate,
  isRecurringRuleActiveAfterAdvance,
} from "../../domain/schedule";

import type { RecurringExecutionRepository } from "../ports";

export type RecurringExecutionResult =
  | { status: "executed"; transactionId: string; nextDueDate: string }
  | { status: "duplicate"; nextDueDate: string }
  | { status: "inactive" | "not_due" };

export class ExecuteRecurringRuleUseCase {
  constructor(private readonly repository: RecurringExecutionRepository) {}

  async execute(
    ruleId: string,
    todayKey = new Date().toISOString().slice(0, 10),
  ): Promise<RecurringExecutionResult> {
    const rule = await this.repository.getExecutionRule(ruleId);

    if (!rule.is_active) {
      return { status: "inactive" };
    }

    if (rule.next_due_date > todayKey) {
      return { status: "not_due" };
    }

    const nextDueDate = advanceRecurringDueDate(
      rule.next_due_date,
      rule.frequency,
    );
    const isActive = isRecurringRuleActiveAfterAdvance(
      nextDueDate,
      rule.end_date,
    );

    if (
      await this.repository.hasTransactionForRuleDate(
        rule.id,
        rule.next_due_date,
      )
    ) {
      await this.repository.updateExecutionState(rule.id, {
        isActive,
        nextDueDate,
      });

      return { status: "duplicate", nextDueDate };
    }

    const accountId = AccountId.from(rule.account_id);
    const previousBalance = await this.repository.getAccountBalance(accountId);
    const nextBalance = previousBalance.add(
      Money.from(transactionEffect(rule.type, rule.amount)),
    );
    const inserted = await this.repository.insertTransaction({
      account_id: rule.account_id,
      amount: rule.amount,
      category_id: rule.category_id,
      date: rule.next_due_date,
      is_recurring: true,
      merchant_name: null,
      note: rule.note,
      recurring_id: rule.id,
      type: rule.type,
      user_id: rule.user_id,
    });
    let balanceWasUpdated = false;

    try {
      await this.repository.setAccountBalance(accountId, nextBalance);
      balanceWasUpdated = true;
      await this.repository.updateExecutionState(rule.id, {
        isActive,
        nextDueDate,
      });
    } catch (error) {
      if (balanceWasUpdated) {
        await this.repository.setAccountBalance(accountId, previousBalance);
      }
      await this.repository.softDeleteTransaction(
        inserted.id,
        new Date().toISOString(),
      );
      throw error;
    }

    return { status: "executed", transactionId: inserted.id, nextDueDate };
  }
}
