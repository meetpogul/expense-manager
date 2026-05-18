import type { TransactionType } from "../domain/types";

export type TransactionRecord = {
  id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  note: string | null;
  merchant_name: string | null;
  is_recurring?: boolean;
  recurring_id?: string | null;
  deleted_at?: string | null;
};

export type TransactionChanges = {
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  note: string | null;
  merchant_name: string | null;
  is_recurring?: boolean;
  recurring_id?: string | null;
};

export type NewTransaction = TransactionChanges & {
  user_id: string;
};
