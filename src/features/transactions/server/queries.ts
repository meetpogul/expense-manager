import "server-only";

import { createClient } from "@/platform/supabase/server";

import type { Account } from "@/features/accounts/domain/types";
import type { DashboardSummary, Transaction } from "../domain/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getTransactions(
  supabase: SupabaseClient,
  filters?: {
    type?: string;
    categoryId?: string;
    from?: string;
    to?: string;
    limit?: number;
  },
) {
  let query = supabase
    .from("transactions")
    .select("*, accounts(id,name,type), categories(id,name,icon,type,color)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters?.categoryId && filters.categoryId !== "all") {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters?.from) {
    query = query.gte("date", filters.from);
  }

  if (filters?.to) {
    query = query.lte("date", filters.to);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeTransaction);
}

export async function getTransactionById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, accounts(id,name,type), categories(id,name,icon,type,color)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeTransaction(data);
}

export async function getDashboardSummary(
  accounts: Account[],
  transactions: Transaction[],
): Promise<DashboardSummary> {
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter((transaction) =>
    transaction.date.startsWith(monthKey),
  );

  return {
    totalBalance: accounts.reduce(
      (total, account) => total + account.balance,
      0,
    ),
    monthlyIncome: monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0),
    monthlyExpense: monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0),
  };
}

function normalizeTransaction(
  transaction: Record<string, unknown>,
): Transaction {
  return {
    ...(transaction as Omit<Transaction, "amount">),
    amount: Number(transaction.amount ?? 0),
  };
}
