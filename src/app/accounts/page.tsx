import Link from "next/link";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { AppShell } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { AccountForm } from "@/features/accounts/components/account-form";
import { formatCurrency } from "@/features/transactions/domain/format";
import { softDeleteAccountAction } from "@/features/accounts/server/actions";
import { getAccounts } from "@/features/accounts/server/queries";

type AccountsPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps) {
  const { edit } = await searchParams;
  const { supabase } = await getSupabaseAndUser();
  const accounts = await getAccounts(supabase);
  const editingAccount = accounts.find((account) => account.id === edit);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Accounts</h1>
            <p className="text-muted-foreground text-sm">
              Keep balances simple and current.
            </p>
          </div>
          {accounts.length > 0 ? (
            <div className="grid gap-3">
              {accounts.map((account) => (
                <Card className="shadow-sm shadow-black/5" key={account.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {account.name}
                        </p>
                        {account.is_default ? <Badge>Default</Badge> : null}
                      </div>
                      <p className="text-muted-foreground text-xs capitalize">
                        {account.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCurrency(account.balance)}
                      </p>
                      <Button asChild size="icon" variant="ghost">
                        <Link
                          aria-label={`Edit ${account.name}`}
                          href={`/accounts?edit=${account.id}`}
                        >
                          <PencilIcon />
                        </Link>
                      </Button>
                      <form action={softDeleteAccountAction}>
                        <input name="id" type="hidden" value={account.id} />
                        <Button
                          aria-label={`Delete ${account.name}`}
                          size="icon"
                          type="submit"
                          variant="ghost"
                        >
                          <Trash2Icon />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              description="Add a wallet, bank account, UPI account, or card to start tracking."
              title="No accounts yet"
            />
          )}
        </section>
        <aside>
          <Card className="sticky top-36 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base">
                {editingAccount ? "Edit account" : "Add account"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AccountForm account={editingAccount} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
