import { beforeEach, describe, expect, it } from "vitest";

import { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import { Money } from "@/shared/domain/value-objects";

import { CreateTransactionUseCase } from "../use-cases/create-transaction.use-case";
import { DeleteTransactionUseCase } from "../use-cases/delete-transaction.use-case";
import { UpdateTransactionUseCase } from "../use-cases/update-transaction.use-case";

import type { TransactionUnitOfWork } from "../ports";
import type {
  NewTransaction,
  TransactionChanges,
  TransactionRecord,
} from "../records";
import type { TransactionInput } from "../../domain/validation";

class InMemoryTransactionRepository implements TransactionUnitOfWork {
  accounts = new Map<string, Money>();
  transactions = new Map<string, TransactionRecord>();
  failBalanceUpdatesForAccounts = new Set<string>();

  async getAccountBalance(accountId: AccountId) {
    const balance = this.accounts.get(accountId.value);

    if (!balance) {
      throw new Error(`Missing account ${accountId.value}`);
    }

    return balance;
  }

  async setAccountBalance(accountId: AccountId, balance: Money) {
    if (this.failBalanceUpdatesForAccounts.has(accountId.value)) {
      throw new Error("Injected balance failure");
    }

    this.accounts.set(accountId.value, balance);
  }

  async insertTransaction(transaction: NewTransaction) {
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
    const existing = await this.getTransaction(transactionId);
    this.transactions.set(transactionId, { ...existing, ...changes });
  }

  async softDeleteTransaction(transactionId: string, deletedAt: string) {
    const existing = await this.getTransaction(transactionId);
    this.transactions.set(transactionId, {
      ...existing,
      deleted_at: deletedAt,
    });
  }

  async restoreTransaction(
    transactionId: string,
    transaction: TransactionRecord,
  ) {
    this.transactions.set(transactionId, { ...transaction });
  }
}

const expenseInput: TransactionInput = {
  accountId: "cash",
  amount: 500,
  categoryId: "food",
  date: "2026-05-18",
  merchantName: "Swiggy",
  note: "Lunch",
  type: "expense",
};

const incomeInput: TransactionInput = {
  accountId: "bank",
  amount: 10000,
  categoryId: null,
  date: "2026-05-18",
  merchantName: null,
  note: "Salary",
  type: "income",
};

describe("transaction use cases", () => {
  let repository: InMemoryTransactionRepository;

  beforeEach(() => {
    repository = new InMemoryTransactionRepository();
    repository.accounts.set("cash", Money.from(5000));
    repository.accounts.set("bank", Money.from(10000));
  });

  it("creates a transaction and applies its balance effect", async () => {
    const result = await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );

    expect(result.id).toBe("transaction-1");
    expect(repository.accounts.get("cash")?.amount).toBe(4500);
  });

  it("soft-deletes a created transaction if balance update fails", async () => {
    repository.failBalanceUpdatesForAccounts.add("cash");

    await expect(
      new CreateTransactionUseCase(repository).execute(expenseInput, "user-1"),
    ).rejects.toThrow("Injected balance failure");

    expect(repository.transactions.get("transaction-1")?.deleted_at).toEqual(
      expect.any(String),
    );
  });

  it("updates same-account transactions with the net delta", async () => {
    await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );

    await new UpdateTransactionUseCase(repository).execute("transaction-1", {
      ...expenseInput,
      amount: 800,
    });

    expect(repository.accounts.get("cash")?.amount).toBe(4200);
  });

  it("skips balance writes when an update has no net balance delta", async () => {
    await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );
    const originalSetBalanceMethod =
      repository.setAccountBalance.bind(repository);
    let calls = 0;
    repository.setAccountBalance = async (accountId, balance) => {
      calls++;
      return originalSetBalanceMethod(accountId, balance);
    };

    await new UpdateTransactionUseCase(repository).execute("transaction-1", {
      ...expenseInput,
      merchantName: "Zomato",
    });

    expect(calls).toBe(0);
  });

  it("rolls back account moves if the second balance update fails", async () => {
    await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );
    repository.failBalanceUpdatesForAccounts.add("bank");

    await expect(
      new UpdateTransactionUseCase(repository).execute("transaction-1", {
        ...expenseInput,
        accountId: "bank",
        amount: 1200,
        categoryId: null,
        type: "income",
      }),
    ).rejects.toThrow("Injected balance failure");

    expect(repository.accounts.get("cash")?.amount).toBe(4500);
    expect(repository.accounts.get("bank")?.amount).toBe(10000);
    expect(repository.transactions.get("transaction-1")).toMatchObject({
      account_id: "cash",
      amount: 500,
      type: "expense",
    });
  });

  it("soft-deletes transactions and reverses balance effects", async () => {
    await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );

    await new DeleteTransactionUseCase(repository).execute(
      "transaction-1",
      "2026-05-18T00:00:00.000Z",
    );

    expect(repository.accounts.get("cash")?.amount).toBe(5000);
    expect(repository.transactions.get("transaction-1")?.deleted_at).toBe(
      "2026-05-18T00:00:00.000Z",
    );
  });

  it("restores soft-deleted transactions when balance reversal fails", async () => {
    await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );
    repository.failBalanceUpdatesForAccounts.add("cash");

    await expect(
      new DeleteTransactionUseCase(repository).execute(
        "transaction-1",
        "2026-05-18T00:00:00.000Z",
      ),
    ).rejects.toThrow("Injected balance failure");

    expect(repository.accounts.get("cash")?.amount).toBe(4500);
    expect(repository.transactions.get("transaction-1")?.deleted_at).toBeNull();
  });

  // ── Additional flows and edge cases ──────────────────────────────────────

  it("creates an income transaction and credits the account", async () => {
    await new CreateTransactionUseCase(repository).execute(
      incomeInput,
      "user-1",
    );

    expect(repository.accounts.get("bank")?.amount).toBe(20000);
    expect(repository.transactions.get("transaction-1")).toMatchObject({
      type: "income",
      amount: 10000,
      account_id: "bank",
      deleted_at: null,
    });
  });

  it("deleting an income transaction debits the balance back", async () => {
    await new CreateTransactionUseCase(repository).execute(
      incomeInput,
      "user-1",
    );
    await new DeleteTransactionUseCase(repository).execute(
      "transaction-1",
      "2026-05-19T00:00:00.000Z",
    );

    expect(repository.accounts.get("bank")?.amount).toBe(10000);
    expect(repository.transactions.get("transaction-1")?.deleted_at).toBe(
      "2026-05-19T00:00:00.000Z",
    );
  });

  it("throws when trying to update a nonexistent transaction", async () => {
    await expect(
      new UpdateTransactionUseCase(repository).execute(
        "nonexistent",
        expenseInput,
      ),
    ).rejects.toThrow("Missing transaction nonexistent");
  });

  it("throws when trying to delete a nonexistent transaction", async () => {
    await expect(
      new DeleteTransactionUseCase(repository).execute(
        "nonexistent",
        "2026-05-18T00:00:00.000Z",
      ),
    ).rejects.toThrow("Missing transaction nonexistent");
  });

  it("throws when account is missing during create", async () => {
    repository.accounts.clear();
    await expect(
      new CreateTransactionUseCase(repository).execute(expenseInput, "user-1"),
    ).rejects.toThrow("Missing account cash");
  });

  it("correctly recalculates delta for income-to-expense type switch on same account", async () => {
    // Create income: bank +10000 = 20000
    await new CreateTransactionUseCase(repository).execute(
      incomeInput,
      "user-1",
    );

    // Update income→expense: reversal(-10000) + expense(-5000) = -15000 net delta
    await new UpdateTransactionUseCase(repository).execute("transaction-1", {
      ...incomeInput,
      type: "expense",
      amount: 5000,
      categoryId: "food",
    });

    // bank was 20000, net delta = +10000(reversal of income) -5000(new expense) ... wait
    // Actually: reversal of income = -10000, new expense = -5000, net = -15000 from 20000 = 5000
    expect(repository.accounts.get("bank")?.amount).toBe(5000);
  });

  it("cross-account update: applies reversal to old and effect to new account", async () => {
    // Create expense on cash: 5000 - 500 = 4500
    await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );

    // Move to bank as income: cash gets +500 (reversal), bank gets +1200 (income)
    await new UpdateTransactionUseCase(repository).execute("transaction-1", {
      ...expenseInput,
      accountId: "bank",
      type: "income",
      amount: 1200,
      categoryId: null,
    });

    expect(repository.accounts.get("cash")?.amount).toBe(5000);
    expect(repository.accounts.get("bank")?.amount).toBe(11200);
    expect(repository.transactions.get("transaction-1")).toMatchObject({
      account_id: "bank",
      type: "income",
      amount: 1200,
    });
  });
});
