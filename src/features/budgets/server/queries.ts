import "server-only";

import { createClient } from "@/platform/supabase/server";
import {
  calculateBudgetUsage,
  getBudgetPeriodWindow,
  sortBudgetsForAttention,
  transactionAppliesToBudget,
} from "../domain/usage";

import type { Budget, BudgetDetail, BudgetWithUsage } from "../domain/types";
import type { Transaction } from "@/features/transactions/domain/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getBudgets(
  supabase: SupabaseClient,
): Promise<BudgetWithUsage[]> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*, categories(id,name,icon,type,color)")
    .is("deleted_at", null)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const budgets = (data ?? []).map(normalizeBudget);
  const transactions = await getBudgetExpenseTransactions(
    supabase,
    getBudgetWindowBounds(budgets),
  );

  return sortBudgetsForAttention(
    budgets.map((budget) => ({
      ...budget,
      usage: calculateBudgetUsage(budget, transactions),
    })),
  );
}

export async function getBudgetById(
  supabase: SupabaseClient,
  budgetId: string,
): Promise<BudgetDetail> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*, categories(id,name,icon,type,color)")
    .eq("id", budgetId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const budget = normalizeBudget(data);
  const usageWindow = getBudgetPeriodWindow(budget);
  const transactions = await getBudgetExpenseTransactions(
    supabase,
    usageWindow,
  );
  const usage = calculateBudgetUsage(budget, transactions);
  const relatedTransactions = transactions.filter((transaction) =>
    transactionAppliesToBudget(budget, transaction, usage.window),
  );

  return {
    ...budget,
    transactions: relatedTransactions,
    usage,
  };
}

async function getBudgetExpenseTransactions(
  supabase: SupabaseClient,
  window?: { from: string; to: string },
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*, accounts(id,name,type), categories(id,name,icon,type,color)")
    .eq("type", "expense")
    .is("deleted_at", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (window) {
    query = query.gte("date", window.from).lte("date", window.to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeTransaction);
}

function getBudgetWindowBounds(budgets: Budget[]) {
  if (budgets.length === 0) {
    return undefined;
  }

  const windows = budgets.map((budget) => getBudgetPeriodWindow(budget));

  return {
    from: windows.reduce(
      (earliest, window) => (window.from < earliest ? window.from : earliest),
      windows[0].from,
    ),
    to: windows.reduce(
      (latest, window) => (window.to > latest ? window.to : latest),
      windows[0].to,
    ),
  };
}

function normalizeBudget(budget: Record<string, unknown>): Budget {
  return {
    ...(budget as Omit<Budget, "amount">),
    amount: Number(budget.amount ?? 0),
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
