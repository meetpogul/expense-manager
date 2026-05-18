import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTransactionMutation,
  deleteTransactionMutation,
  updateTransactionMutation,
  type FinanceMutationRepository,
  type MutationTransaction,
  type NewTransaction,
  type TransactionChanges,
} from "../mutations";
import type { TransactionInput } from "../../domain/validation";

type FailurePoint =
  | "insertTransaction"
  | "updateTransaction"
  | "softDeleteTransaction"
  | "setAccountBalance";

class InMemoryFinanceRepository implements FinanceMutationRepository {
  accounts = new Map<string, number>();
  transactions = new Map<string, MutationTransaction>();
  failOnceAt: FailurePoint | null = null;
  setAccountBalanceCalls = 0;

  async getAccountBalance(accountId: string) {
    const balance = this.accounts.get(accountId);

    if (balance === undefined) {
      throw new Error(`Missing account ${accountId}`);
    }

    return balance;
  }

  async setAccountBalance(accountId: string, balance: number) {
    this.maybeFail("setAccountBalance");
    this.setAccountBalanceCalls += 1;
    this.accounts.set(accountId, balance);
  }

  async insertTransaction(transaction: NewTransaction) {
    this.maybeFail("insertTransaction");
    const id = `transaction-${this.transactions.size + 1}`;
    this.transactions.set(id, { id, ...transaction, deleted_at: null });

    return { id };
  }

  async getTransaction(transactionId: string) {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error(`Missing transaction ${transactionId}`);
    }

    return { ...transaction };
  }

  async updateTransaction(transactionId: string, changes: TransactionChanges) {
    this.maybeFail("updateTransaction");
    const transaction = await this.getTransaction(transactionId);
    this.transactions.set(transactionId, { ...transaction, ...changes });
  }

  async softDeleteTransaction(transactionId: string, deletedAt: string) {
    this.maybeFail("softDeleteTransaction");
    const transaction = await this.getTransaction(transactionId);
    this.transactions.set(transactionId, {
      ...transaction,
      deleted_at: deletedAt,
    });
  }

  async restoreTransaction(
    transactionId: string,
    transaction: MutationTransaction,
  ) {
    this.transactions.set(transactionId, { ...transaction });
  }

  private maybeFail(point: FailurePoint) {
    if (this.failOnceAt === point) {
      this.failOnceAt = null;
      throw new Error(`Injected ${point} failure`);
    }
  }
}

const expenseInput: TransactionInput = {
  type: "expense",
  amount: 500,
  accountId: "cash",
  categoryId: "food",
  date: "2026-05-10",
  note: "Lunch",
  merchantName: "Swiggy",
};

describe("transaction mutations", () => {
  let repository: InMemoryFinanceRepository;

  beforeEach(() => {
    vi.useRealTimers();
    repository = new InMemoryFinanceRepository();
    repository.accounts.set("cash", 5000);
    repository.accounts.set("bank", 10000);
  });

  it("creates a transaction and applies the account balance effect", async () => {
    const result = await createTransactionMutation(
      repository,
      expenseInput,
      "user-1",
    );

    expect(result.id).toBe("transaction-1");
    expect(repository.accounts.get("cash")).toBe(4500);
    expect(repository.transactions.get(result.id)).toMatchObject({
      user_id: "user-1",
      account_id: "cash",
      amount: 500,
      deleted_at: null,
    });
  });

  it("soft-deletes the inserted transaction if balance update fails after create", async () => {
    repository.failOnceAt = "setAccountBalance";

    await expect(
      createTransactionMutation(repository, expenseInput, "user-1"),
    ).rejects.toThrow("Injected setAccountBalance failure");

    expect(repository.accounts.get("cash")).toBe(5000);
    expect(repository.transactions.get("transaction-1")?.deleted_at).toEqual(
      expect.any(String),
    );
  });

  it("updates a same-account transaction by applying only the net delta", async () => {
    await createTransactionMutation(repository, expenseInput, "user-1");

    await updateTransactionMutation(repository, "transaction-1", {
      ...expenseInput,
      amount: 800,
    });

    expect(repository.accounts.get("cash")).toBe(4200);
    expect(repository.transactions.get("transaction-1")).toMatchObject({
      amount: 800,
    });
  });

  it("does not write a balance when an edit has no balance delta", async () => {
    await createTransactionMutation(repository, expenseInput, "user-1");
    repository.setAccountBalanceCalls = 0;

    await updateTransactionMutation(repository, "transaction-1", {
      ...expenseInput,
      note: "Same amount, clearer note",
    });

    expect(repository.setAccountBalanceCalls).toBe(0);
    expect(repository.accounts.get("cash")).toBe(4500);
    expect(repository.transactions.get("transaction-1")).toMatchObject({
      note: "Same amount, clearer note",
    });
  });

  it("updates a moved transaction by reversing the old account and applying the new account", async () => {
    await createTransactionMutation(repository, expenseInput, "user-1");

    await updateTransactionMutation(repository, "transaction-1", {
      ...expenseInput,
      accountId: "bank",
      type: "income",
      amount: 1200,
      categoryId: null,
    });

    expect(repository.accounts.get("cash")).toBe(5000);
    expect(repository.accounts.get("bank")).toBe(11200);
    expect(repository.transactions.get("transaction-1")).toMatchObject({
      account_id: "bank",
      type: "income",
      amount: 1200,
    });
  });

  it("restores transaction and balances when a second balance update fails during account move", async () => {
    await createTransactionMutation(repository, expenseInput, "user-1");
    repository.setAccountBalanceCalls = 0;
    repository.setAccountBalance = async (accountId, balance) => {
      repository.setAccountBalanceCalls += 1;
      if (repository.setAccountBalanceCalls === 2) {
        throw new Error("Injected second balance failure");
      }
      repository.accounts.set(accountId, balance);
    };

    await expect(
      updateTransactionMutation(repository, "transaction-1", {
        ...expenseInput,
        accountId: "bank",
        type: "income",
        amount: 1200,
        categoryId: null,
      }),
    ).rejects.toThrow("Injected second balance failure");

    expect(repository.accounts.get("cash")).toBe(4500);
    expect(repository.accounts.get("bank")).toBe(10000);
    expect(repository.transactions.get("transaction-1")).toMatchObject({
      account_id: "cash",
      type: "expense",
      amount: 500,
      deleted_at: null,
    });
  });

  it("soft-deletes a transaction and reverses its balance effect", async () => {
    await createTransactionMutation(repository, expenseInput, "user-1");

    await deleteTransactionMutation(
      repository,
      "transaction-1",
      "2026-05-10T10:00:00.000Z",
    );

    expect(repository.accounts.get("cash")).toBe(5000);
    expect(repository.transactions.get("transaction-1")?.deleted_at).toBe(
      "2026-05-10T10:00:00.000Z",
    );
  });

  it("restores a soft-deleted transaction if delete balance reversal fails", async () => {
    await createTransactionMutation(repository, expenseInput, "user-1");
    repository.failOnceAt = "setAccountBalance";

    await expect(
      deleteTransactionMutation(
        repository,
        "transaction-1",
        "2026-05-10T10:00:00.000Z",
      ),
    ).rejects.toThrow("Injected setAccountBalance failure");

    expect(repository.accounts.get("cash")).toBe(4500);
    expect(repository.transactions.get("transaction-1")?.deleted_at).toBeNull();
  });
});
