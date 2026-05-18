import type {
  NewTransaction,
  TransactionChanges,
  TransactionRecord,
} from "../application/records";

export function mutationTransactionFromRow(
  row: Record<string, unknown>,
): TransactionRecord {
  return {
    account_id: String(row.account_id),
    amount: Number(row.amount ?? 0),
    category_id: row.category_id ? String(row.category_id) : null,
    date: String(row.date),
    deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    id: String(row.id),
    is_recurring: Boolean(row.is_recurring ?? false),
    merchant_name: row.merchant_name ? String(row.merchant_name) : null,
    note: row.note ? String(row.note) : null,
    recurring_id: row.recurring_id ? String(row.recurring_id) : null,
    type: row.type === "income" ? "income" : "expense",
  };
}

export function rowFromTransactionChanges(changes: TransactionChanges) {
  return {
    account_id: changes.account_id,
    amount: changes.amount,
    category_id: changes.category_id,
    date: changes.date,
    merchant_name: changes.merchant_name,
    note: changes.note,
    type: changes.type,
    ...("is_recurring" in changes
      ? { is_recurring: changes.is_recurring ?? false }
      : {}),
    ...("recurring_id" in changes
      ? { recurring_id: changes.recurring_id ?? null }
      : {}),
  };
}

export function rowFromNewTransaction(transaction: NewTransaction) {
  return {
    ...rowFromTransactionChanges(transaction),
    user_id: transaction.user_id,
  };
}
