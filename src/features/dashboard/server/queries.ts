import type { Account } from "@/features/accounts/domain/types";
import type { Transaction } from "@/features/transactions/domain/types";
import type { DashboardSummary } from "../domain/types";

/**
 * Computes the dashboard summary aggregate from pre-fetched accounts and
 * transactions. Pure function — no Supabase call needed.
 *
 * Moved from `transactions/server/queries.ts` per the architecture roadmap.
 * The original location re-exports this function for backward compatibility.
 */
export function getDashboardSummary(
  accounts: Account[],
  transactions: Transaction[],
): DashboardSummary {
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
