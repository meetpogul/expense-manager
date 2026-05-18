import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import { getAccounts } from "@/features/accounts/server/queries";
import { getCategories } from "@/features/categories/server/queries";
import { getTransactions } from "@/features/transactions/server/queries";

type TransactionsPageProps = {
  searchParams: Promise<{
    type?: string;
    category?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const { supabase } = await getSupabaseAndUser();
  const accounts = await getAccounts(supabase);
  const categories = await getCategories(supabase);
  const transactions = await getTransactions(supabase, {
    type: params.type,
    categoryId: params.category,
    from: params.from,
    to: params.to,
  });

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">
                Transactions
              </h1>
              <p className="text-muted-foreground text-sm">
                Scan, filter, and edit your ledger.
              </p>
            </div>
            <Button asChild className="sm:hidden">
              <Link href="#add-transaction">
                <PlusIcon data-icon="inline-start" />
                Add
              </Link>
            </Button>
          </div>
          <TransactionFilters
            categories={categories}
            categoryId={params.category}
            from={params.from}
            to={params.to}
            type={params.type}
          />
          <TransactionList transactions={transactions} />
        </section>
        <aside id="add-transaction">
          <Card className="sticky top-36 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base">Add transaction</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length > 0 ? (
                <TransactionForm accounts={accounts} categories={categories} />
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
        </aside>
      </div>
    </AppShell>
  );
}
