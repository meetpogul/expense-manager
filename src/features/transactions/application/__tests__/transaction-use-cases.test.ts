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
  failSetBalanceOnCall: number | null = null;
  setBalanceCalls = 0;

  async getAccountBalance(accountId: AccountId) {
    const balance = this.accounts.get(accountId.value);

    if (!balance) {
      throw new Error(`Missing account ${accountId.value}`);
    }

    return balance;
  }

  async setAccountBalance(accountId: AccountId, balance: Money) {
    this.setBalanceCalls += 1;

    if (this.failSetBalanceOnCall === this.setBalanceCalls) {
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
    repository.failSetBalanceOnCall = 1;

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
    repository.setBalanceCalls = 0;

    await new UpdateTransactionUseCase(repository).execute("transaction-1", {
      ...expenseInput,
      merchantName: "Zomato",
    });

    expect(repository.setBalanceCalls).toBe(0);
  });

  it("rolls back account moves if the second balance update fails", async () => {
    await new CreateTransactionUseCase(repository).execute(
      expenseInput,
      "user-1",
    );
    repository.setBalanceCalls = 0;
    repository.failSetBalanceOnCall = 2;

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
    repository.setBalanceCalls = 0;
    repository.failSetBalanceOnCall = 1;

    await expect(
      new DeleteTransactionUseCase(repository).execute(
        "transaction-1",
        "2026-05-18T00:00:00.000Z",
      ),
    ).rejects.toThrow("Injected balance failure");

    expect(repository.accounts.get("cash")?.amount).toBe(4500);
    expect(repository.transactions.get("transaction-1")?.deleted_at).toBeNull();
  });
});
