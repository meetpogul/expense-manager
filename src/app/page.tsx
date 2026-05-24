import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your expenses, budgets, and financial goals.",
};

import Link from "next/link";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PlusIcon,
  WalletCardsIcon,
} from "lucide-react";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { TransactionFormContainer } from "@/features/transactions/components/transaction-form";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/features/transactions/domain/format";
import { getAccounts } from "@/features/accounts/server/queries";
import { getCategories } from "@/features/categories/server/queries";
import {
  getDashboardSummary,
  getTransactions,
} from "@/features/transactions/server/queries";

export default async function DashboardPage() {
  const { supabase } = await getSupabaseAndUser();
  const accounts = await getAccounts(supabase);
  const categories = await getCategories(supabase);
  const transactions = await getTransactions(supabase);
  const recentTransactions = transactions.slice(0, 6);
  const summary = await getDashboardSummary(accounts, transactions);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
                {formatCurrency(summary.totalBalance)}
              </h1>
              <p className="text-muted-foreground text-sm">
                Total balance across {accounts.length} active account
                {accounts.length === 1 ? "" : "s"}
              </p>
            </div>
            <Button asChild className="sm:hidden">
              <Link href="/transactions">
                <PlusIcon data-icon="inline-start" />
                Add
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard
              detail="Current month"
              icon={<WalletCardsIcon />}
              label="Balance"
              value={formatCompactCurrency(summary.totalBalance)}
            />
            <SummaryCard
              detail="Current month"
              icon={<ArrowDownLeftIcon />}
              label="Income"
              tone="income"
              value={formatCompactCurrency(summary.monthlyIncome)}
            />
            <SummaryCard
              detail="Current month"
              icon={<ArrowUpRightIcon />}
              label="Expense"
              tone="expense"
              value={formatCompactCurrency(summary.monthlyExpense)}
            />
          </div>
          <Card className="shadow-sm shadow-black/5">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-base">Recent transactions</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link href="/transactions">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <TransactionList compact transactions={recentTransactions} />
            </CardContent>
          </Card>
        </section>
        <aside className="flex flex-col gap-6">
          <Card className="shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base">Add transaction</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length > 0 ? (
                <TransactionFormContainer
                  accounts={accounts}
                  categories={categories}
                  compact
                />
              ) : (
                <Empty
                  action={
                    <Button asChild size="sm">
                      <Link href="/accounts">Add account</Link>
                    </Button>
                  }
                  description="Create one account before tracking transactions."
                  title="No account yet"
                />
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base">Accounts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {accounts.length > 0 ? (
                accounts.slice(0, 4).map((account) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3"
                    key={account.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {account.name}
                      </p>
                      <p className="text-muted-foreground text-xs capitalize">
                        {account.type.replace("_", " ")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No accounts yet.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
