import { describe, expect, it } from "vitest";

import { ExecuteRecurringRuleUseCase } from "../use-cases/execute-recurring-rule.use-case";
import { Money } from "@/shared/domain/value-objects";

import type {
  RecurringExecutionRepository,
  RecurringExecutionRule,
} from "../ports";
import type { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import type { NewTransaction } from "@/shared/application/records";

class InMemoryRecurringExecutionRepository implements RecurringExecutionRepository {
  accounts = new Map<string, Money>();
  rules = new Map<string, RecurringExecutionRule>();
  transactions = new Map<
    string,
    NewTransaction & { deleted_at: string | null; id: string }
  >();
  failOnSetAccountBalance = false;
  failOnUpdateExecutionState = false;

  async getExecutionRule(ruleId: string) {
    const rule = this.rules.get(ruleId);

    if (!rule) {
      throw new Error(`Missing rule ${ruleId}`);
    }

    return { ...rule };
  }

  async hasTransactionForRuleDate(ruleId: string, date: string) {
    return [...this.transactions.values()].some(
      (transaction) =>
        transaction.recurring_id === ruleId &&
        transaction.date === date &&
        !transaction.deleted_at,
    );
  }

  async insertTransaction(transaction: NewTransaction) {
    const id = `transaction-${this.transactions.size + 1}`;
    this.transactions.set(id, { ...transaction, deleted_at: null, id });

    return { id };
  }

  async softDeleteTransaction(transactionId: string, deletedAt: string) {
    const transaction = this.transactions.get(transactionId);

    if (transaction) {
      this.transactions.set(transactionId, {
        ...transaction,
        deleted_at: deletedAt,
      });
    }
  }

  async getAccountBalance(accountId: AccountId) {
    const balance = this.accounts.get(accountId.value);

    if (!balance) {
      throw new Error(`Missing account ${accountId.value}`);
    }

    return balance;
  }

  async setAccountBalance(accountId: AccountId, balance: Money) {
    if (this.failOnSetAccountBalance) {
      this.failOnSetAccountBalance = false;
      throw new Error("Injected balance failure");
    }

    this.accounts.set(accountId.value, balance);
  }

  async updateExecutionState(
    ruleId: string,
    state: { isActive: boolean; nextDueDate: string },
  ) {
    if (this.failOnUpdateExecutionState) {
      this.failOnUpdateExecutionState = false;
      throw new Error("Injected state update failure");
    }

    const rule = await this.getExecutionRule(ruleId);
    this.rules.set(ruleId, {
      ...rule,
      is_active: state.isActive,
      next_due_date: state.nextDueDate,
    });
  }
}

function executionRepository() {
  const repo = new InMemoryRecurringExecutionRepository();
  repo.accounts.set("bank", Money.from(10000));
  repo.rules.set("rule-rent", {
    account_id: "bank",
    amount: 2500,
    category_id: "rent",
    end_date: null,
    frequency: "monthly",
    id: "rule-rent",
    is_active: true,
    next_due_date: "2026-05-01",
    note: "Rent",
    type: "expense",
    user_id: "user-1",
  });

  return repo;
}

describe("recurring rule execution", () => {
  it("skips inactive and future rules", async () => {
    const repo = executionRepository();

    repo.rules.set("rule-rent", {
      ...repo.rules.get("rule-rent")!,
      is_active: false,
    });

    await expect(
      new ExecuteRecurringRuleUseCase(repo).execute("rule-rent", "2026-05-18"),
    ).resolves.toEqual({ status: "inactive" });

    repo.rules.set("rule-rent", {
      ...repo.rules.get("rule-rent")!,
      is_active: true,
      next_due_date: "2026-06-01",
    });

    await expect(
      new ExecuteRecurringRuleUseCase(repo).execute("rule-rent", "2026-05-18"),
    ).resolves.toEqual({ status: "not_due" });
  });

  it("creates a linked transaction and advances the due date", async () => {
    const repo = executionRepository();

    const result = await new ExecuteRecurringRuleUseCase(repo).execute(
      "rule-rent",
      "2026-05-18",
    );

    expect(result).toMatchObject({
      nextDueDate: "2026-06-01",
      status: "executed",
      transactionId: "transaction-1",
    });
    expect(repo.accounts.get("bank")?.amount).toBe(7500);
    expect(repo.transactions.get("transaction-1")).toMatchObject({
      date: "2026-05-01",
      is_recurring: true,
      recurring_id: "rule-rent",
    });
    expect(repo.rules.get("rule-rent")).toMatchObject({
      is_active: true,
      next_due_date: "2026-06-01",
    });
  });

  it("advances an already generated due date without duplicating", async () => {
    const repo = executionRepository();
    await repo.insertTransaction({
      account_id: "bank",
      amount: 2500,
      category_id: "rent",
      date: "2026-05-01",
      is_recurring: true,
      merchant_name: null,
      note: "Rent",
      recurring_id: "rule-rent",
      type: "expense",
      user_id: "user-1",
    });

    const result = await new ExecuteRecurringRuleUseCase(repo).execute(
      "rule-rent",
      "2026-05-18",
    );

    expect(result).toEqual({
      nextDueDate: "2026-06-01",
      status: "duplicate",
    });
    expect(repo.transactions.size).toBe(1);
    expect(repo.accounts.get("bank")?.amount).toBe(10000);
    expect(repo.rules.get("rule-rent")?.next_due_date).toBe("2026-06-01");
  });

  it("deactivates after processing when the next due date passes the end date", async () => {
    const repo = executionRepository();
    repo.rules.set("rule-rent", {
      ...repo.rules.get("rule-rent")!,
      end_date: "2026-05-31",
    });

    await new ExecuteRecurringRuleUseCase(repo).execute(
      "rule-rent",
      "2026-05-18",
    );

    expect(repo.rules.get("rule-rent")).toMatchObject({
      is_active: false,
      next_due_date: "2026-06-01",
    });
  });

  it("soft-deletes the transaction if the balance update fails", async () => {
    const repo = executionRepository();
    repo.failOnSetAccountBalance = true;

    await expect(
      new ExecuteRecurringRuleUseCase(repo).execute("rule-rent", "2026-05-18"),
    ).rejects.toThrow("Injected balance failure");

    expect(repo.accounts.get("bank")?.amount).toBe(10000);
    expect(repo.transactions.get("transaction-1")?.deleted_at).toEqual(
      expect.any(String),
    );
    expect(repo.rules.get("rule-rent")?.next_due_date).toBe("2026-05-01");
  });

  // ── Additional flows ──────────────────────────────────────────────────────

  it("income rule credits the account balance", async () => {
    const repo = executionRepository();
    repo.rules.set("rule-rent", {
      ...repo.rules.get("rule-rent")!,
      type: "income",
      category_id: null,
    });

    await new ExecuteRecurringRuleUseCase(repo).execute(
      "rule-rent",
      "2026-05-18",
    );

    // income effect: +2500 to bank (10000 + 2500 = 12500)
    expect(repo.accounts.get("bank")?.amount).toBe(12500);
  });

  it("rule with no end date stays active after advancing", async () => {
    const repo = executionRepository();
    // No end_date (null) → should remain active
    await new ExecuteRecurringRuleUseCase(repo).execute(
      "rule-rent",
      "2026-05-18",
    );

    expect(repo.rules.get("rule-rent")?.is_active).toBe(true);
  });

  it("monthly month-end clamping: Jan 31 → Feb 28 (non-leap year)", async () => {
    const repo = executionRepository();
    repo.rules.set("rule-rent", {
      ...repo.rules.get("rule-rent")!,
      next_due_date: "2026-01-31",
      frequency: "monthly",
    });

    const result = await new ExecuteRecurringRuleUseCase(repo).execute(
      "rule-rent",
      "2026-02-28",
    );

    expect(result).toMatchObject({
      status: "executed",
      nextDueDate: "2026-02-28",
    });
  });

  it("updateExecutionState failure rolls back: balance restored, transaction soft-deleted", async () => {
    const repo = executionRepository();
    repo.failOnUpdateExecutionState = true;

    await expect(
      new ExecuteRecurringRuleUseCase(repo).execute("rule-rent", "2026-05-18"),
    ).rejects.toThrow("Injected state update failure");

    // balance should be rolled back to original
    expect(repo.accounts.get("bank")?.amount).toBe(10000);
    // transaction soft-deleted
    expect(repo.transactions.get("transaction-1")?.deleted_at).toEqual(
      expect.any(String),
    );
    // next_due_date not advanced
    expect(repo.rules.get("rule-rent")?.next_due_date).toBe("2026-05-01");
  });
});
