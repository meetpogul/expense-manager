import { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import { CategoryId } from "@/features/categories/domain/category-id";
import { CalendarDate, Money, UserId } from "@/shared/domain/value-objects";
import { DomainError } from "@/shared/domain/domain-error";

import { TransactionId } from "../value-objects/transaction-id";

import type { TransactionType } from "../types";

export type TransactionProps = {
  id: TransactionId;
  userId: UserId;
  accountId: AccountId;
  categoryId: CategoryId | null;
  type: TransactionType;
  amount: Money;
  date: CalendarDate;
  note: string | null;
  merchantName: string | null;
  deletedAt: string | null;
};

export type TransactionDraft = Omit<TransactionProps, "id" | "deletedAt"> & {
  id?: TransactionId;
};

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  /**
   * Factory keeps the expense invariant in one place: expenses need a category.
   */
  static createExpense(draft: TransactionDraft) {
    if (!draft.categoryId) {
      throw new DomainError(
        "Expense transactions require a category.",
        "transaction.expense_category_required",
      );
    }

    return new Transaction({
      ...draft,
      deletedAt: null,
      id: draft.id ?? TransactionId.from("pending"),
      type: "expense",
    });
  }

  static createIncome(draft: TransactionDraft) {
    return new Transaction({
      ...draft,
      categoryId: draft.categoryId ?? null,
      deletedAt: null,
      id: draft.id ?? TransactionId.from("pending"),
      type: "income",
    });
  }

  static restoreFromPersistence(props: TransactionProps) {
    if (props.type === "expense" && !props.categoryId) {
      throw new DomainError(
        "Persisted expense is missing a category.",
        "transaction.persisted_invalid",
      );
    }

    return new Transaction(props);
  }

  get id() {
    return this.props.id;
  }

  get accountId() {
    return this.props.accountId;
  }

  get type() {
    return this.props.type;
  }

  get amount() {
    return this.props.amount;
  }

  balanceEffect() {
    return this.props.type === "income"
      ? this.props.amount
      : this.props.amount.negate();
  }

  reverseBalanceEffect() {
    return this.balanceEffect().negate();
  }

  changeTo(next: TransactionDraft) {
    return next.type === "income"
      ? Transaction.createIncome({ ...next, id: this.props.id })
      : Transaction.createExpense({ ...next, id: this.props.id });
  }

  toSnapshot() {
    return { ...this.props };
  }
}
