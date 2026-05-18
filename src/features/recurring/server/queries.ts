import "server-only";

import { createClient } from "@/platform/supabase/server";

import type { RecurringRule } from "../domain/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getRecurringRules(
  supabase: SupabaseClient,
): Promise<RecurringRule[]> {
  const { data, error } = await supabase
    .from("recurring_rules")
    .select("*, accounts(id,name,type), categories(id,name,icon,type,color)")
    .order("is_active", { ascending: false })
    .order("next_due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeRecurringRule);
}

function normalizeRecurringRule(rule: Record<string, unknown>): RecurringRule {
  return {
    ...(rule as Omit<RecurringRule, "amount">),
    amount: Number(rule.amount ?? 0),
  };
}
