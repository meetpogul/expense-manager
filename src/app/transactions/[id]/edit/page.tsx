import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Transaction",
  description: "Update details for an existing transaction.",
};

import Link from "next/link";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { TransactionFormContainer } from "@/features/transactions/components/transaction-form";
import { deleteTransactionAction } from "@/features/transactions/server/actions";
import { getAccounts } from "@/features/accounts/server/queries";
import { getCategories } from "@/features/categories/server/queries";
import { getTransactionById } from "@/features/transactions/server/queries";

type EditTransactionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const { supabase } = await getSupabaseAndUser();
  const [accounts, categories, transaction] = await Promise.all([
    getAccounts(supabase),
    getCategories(supabase),
    getTransactionById(supabase, id),
  ]);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <Button asChild className="w-fit" variant="ghost">
          <Link href="/transactions">
            <ArrowLeftIcon data-icon="inline-start" />
            Transactions
          </Link>
        </Button>
        <Card className="shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="text-base">Edit transaction</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <TransactionFormContainer
              accounts={accounts}
              categories={categories}
              transaction={transaction}
            />
            <form action={deleteTransactionAction}>
              <input name="id" type="hidden" value={transaction.id} />
              <Button className="w-full" type="submit" variant="outline">
                <Trash2Icon data-icon="inline-start" />
                Delete transaction
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
