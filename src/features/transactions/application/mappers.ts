import { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import { CategoryId } from "@/features/categories/domain/category-id";
import { CalendarDate, Money, UserId } from "@/shared/domain/value-objects";

import { Transaction } from "../domain/entities/transaction";
import { TransactionId } from "../domain/value-objects/transaction-id";

import type { TransactionRecord } from "./records";
import type { TransactionInput } from "../domain/validation";

export function transactionDraftFromInput(
  input: TransactionInput,
  userId: string,
) {
  return {
    accountId: AccountId.from(input.accountId),
    amount: Money.positive(input.amount),
    categoryId: input.categoryId ? CategoryId.from(input.categoryId) : null,
    date: CalendarDate.from(input.date),
    merchantName: input.merchantName,
    note: input.note,
    type: input.type,
    userId: UserId.from(userId),
  };
}

export function transactionFromInput(input: TransactionInput, userId: string) {
  const draft = transactionDraftFromInput(input, userId);

  return input.type === "income"
    ? Transaction.createIncome(draft)
    : Transaction.createExpense(draft);
}

export function changesFromTransaction(transaction: Transaction) {
  const snapshot = transaction.toSnapshot();

  return {
    account_id: snapshot.accountId.value,
    amount: snapshot.amount.amount,
    category_id: snapshot.categoryId?.value ?? null,
    date: snapshot.date.value,
    merchant_name: snapshot.merchantName,
    note: snapshot.note,
    type: snapshot.type,
  };
}

export function newTransactionFromDomain(transaction: Transaction) {
  const snapshot = transaction.toSnapshot();

  return {
    ...changesFromTransaction(transaction),
    user_id: snapshot.userId.value,
  };
}

export function transactionFromRecord(row: TransactionRecord) {
  return Transaction.restoreFromPersistence({
    accountId: AccountId.from(row.account_id),
    amount: Money.positive(row.amount),
    categoryId: row.category_id ? CategoryId.from(row.category_id) : null,
    date: CalendarDate.from(row.date),
    deletedAt: row.deleted_at ?? null,
    id: TransactionId.from(row.id),
    merchantName: row.merchant_name,
    note: row.note,
    type: row.type,
    userId: UserId.from("current-user"),
  });
}
