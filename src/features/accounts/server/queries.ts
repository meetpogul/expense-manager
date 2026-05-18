import "server-only";

import { createClient } from "@/platform/supabase/server";

import type { Account } from "../domain/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getAccounts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeAccount);
}

export function normalizeAccount(account: Record<string, unknown>): Account {
  return {
    ...(account as Omit<Account, "balance">),
    balance: Number(account.balance ?? 0),
  };
}
