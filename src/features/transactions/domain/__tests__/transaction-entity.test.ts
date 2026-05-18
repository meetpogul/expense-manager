import { describe, expect, it } from "vitest";

import { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import { CategoryId } from "@/features/categories/domain/category-id";
import { DomainError } from "@/shared/domain/domain-error";
import { CalendarDate, Money, UserId } from "@/shared/domain/value-objects";

import { Transaction } from "../entities/transaction";
import { TransactionId } from "../value-objects/transaction-id";

const baseDraft = {
  accountId: AccountId.from("account-1"),
  amount: Money.positive(450),
  categoryId: CategoryId.from("category-food"),
  date: CalendarDate.from("2026-05-18"),
  merchantName: "Swiggy",
  note: "Dinner",
  userId: UserId.from("user-1"),
};

describe("Transaction entity", () => {
  it("creates expenses with balance effects and reversals", () => {
    const transaction = Transaction.createExpense({
      ...baseDraft,
      type: "expense",
    });

    expect(transaction.id.value).toBe("pending");
    expect(transaction.amount.amount).toBe(450);
    expect(transaction.balanceEffect().amount).toBe(-450);
    expect(transaction.reverseBalanceEffect().amount).toBe(450);
  });

  it("requires categories for expenses but not income", () => {
    expect(() =>
      Transaction.createExpense({
        ...baseDraft,
        categoryId: null,
        type: "expense",
      }),
    ).toThrow(DomainError);

    expect(
      Transaction.createIncome({
        ...baseDraft,
        categoryId: null,
        type: "income",
      }).balanceEffect().amount,
    ).toBe(450);
  });

  it("restores persisted transactions and changes to new input", () => {
    const previous = Transaction.restoreFromPersistence({
      ...baseDraft,
      deletedAt: null,
      id: TransactionId.from("transaction-1"),
      type: "expense",
    });
    const next = previous.changeTo({
      ...baseDraft,
      amount: Money.positive(1000),
      categoryId: null,
      type: "income",
    });

    expect(next.id.value).toBe("transaction-1");
    expect(next.type).toBe("income");
    expect(next.toSnapshot()).toMatchObject({
      deletedAt: null,
      merchantName: "Swiggy",
      note: "Dinner",
    });
    expect(next.balanceEffect().amount).toBe(1000);
  });

  it("rejects invalid persisted expense rows", () => {
    expect(() =>
      Transaction.restoreFromPersistence({
        ...baseDraft,
        categoryId: null,
        deletedAt: null,
        id: TransactionId.from("transaction-1"),
        type: "expense",
      }),
    ).toThrow(DomainError);
  });
});
