import { Money } from "@/shared/domain/value-objects";
import { numberFromNumeric } from "@/platform/supabase/normalize";

import {
  mutationTransactionFromRow,
  rowFromNewTransaction,
  rowFromTransactionChanges,
} from "./transaction-row.mapper";

import type { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import type { createClient } from "@/platform/supabase/server";
import type { TransactionUnitOfWork } from "../application/ports";
import type {
  NewTransaction,
  TransactionChanges,
  TransactionRecord,
} from "../application/records";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class SupabaseTransactionRepository implements TransactionUnitOfWork {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAccountBalance(accountId: AccountId) {
    const { data, error } = await this.supabase
      .from("accounts")
      .select("balance")
      .eq("id", accountId.value)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Money.from(numberFromNumeric(data.balance));
  }

  async setAccountBalance(accountId: AccountId, balance: Money) {
    const { error } = await this.supabase
      .from("accounts")
      .update({ balance: balance.amount })
      .eq("id", accountId.value);

    if (error) {
      throw new Error(error.message);
    }
  }

  async insertTransaction(transaction: NewTransaction) {
    const { data, error } = await this.supabase
      .from("transactions")
      .insert(rowFromNewTransaction(transaction))
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { id: String(data.id) };
  }

  async getTransaction(transactionId: string): Promise<TransactionRecord> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mutationTransactionFromRow(data);
  }

  async updateTransaction(transactionId: string, changes: TransactionChanges) {
    const { error } = await this.supabase
      .from("transactions")
      .update(rowFromTransactionChanges(changes))
      .eq("id", transactionId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async softDeleteTransaction(transactionId: string, deletedAt: string) {
    const { error } = await this.supabase
      .from("transactions")
      .update({ deleted_at: deletedAt })
      .eq("id", transactionId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async restoreTransaction(
    transactionId: string,
    transaction: TransactionRecord,
  ) {
    const { error } = await this.supabase
      .from("transactions")
      .update({
        ...rowFromTransactionChanges({
          account_id: transaction.account_id,
          amount: transaction.amount,
          category_id: transaction.category_id,
          date: transaction.date,
          merchant_name: transaction.merchant_name,
          note: transaction.note,
          type: transaction.type,
        }),
        deleted_at: transaction.deleted_at ?? null,
      })
      .eq("id", transactionId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
