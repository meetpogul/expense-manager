import "server-only";

import { createClient } from "@/platform/supabase/server";

import type { Transaction } from "../domain/types";

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
    .is("deleted_at", null)
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

// getDashboardSummary has moved to features/dashboard/server/queries.ts.
// Re-exported here for backward compatibility.
export { getDashboardSummary } from "@/features/dashboard/server/queries";

function normalizeTransaction(
  transaction: Record<string, unknown>,
): Transaction {
  return {
    ...(transaction as Omit<Transaction, "amount">),
    amount: Number(transaction.amount ?? 0),
  };
}
