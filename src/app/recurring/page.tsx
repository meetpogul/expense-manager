import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { getAccounts } from "@/features/accounts/server/queries";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { getCategories } from "@/features/categories/server/queries";
import { RecurringRuleForm } from "@/features/recurring/components/recurring-rule-form";
import { RecurringRuleList } from "@/features/recurring/components/recurring-rule-list";
import { getRecurringRules } from "@/features/recurring/server/queries";

type RecurringPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function RecurringPage({
  searchParams,
}: RecurringPageProps) {
  const { edit } = await searchParams;
  const { supabase } = await getSupabaseAndUser();
  const accounts = await getAccounts(supabase);
  const categories = await getCategories(supabase);
  const rules = await getRecurringRules(supabase);
  const editingRule = rules.find((rule) => rule.id === edit);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">
                Recurring
              </h1>
              <p className="text-muted-foreground text-sm">
                Keep repeating income and expenses visible without the noise.
              </p>
            </div>
            <Button asChild className="sm:hidden">
              <Link href="#add-recurring">
                <PlusIcon data-icon="inline-start" />
                Add
              </Link>
            </Button>
          </div>
          <RecurringRuleList rules={rules} />
        </section>
        <aside id="add-recurring">
          <Card className="sticky top-36 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base">
                {editingRule ? "Edit recurring" : "Add recurring"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length > 0 ? (
                <RecurringRuleForm
                  accounts={accounts}
                  categories={categories}
                  rule={editingRule}
                />
              ) : (
                <Empty
                  action={
                    <Button asChild size="sm">
                      <Link href="/accounts">Add account</Link>
                    </Button>
                  }
                  description="Create one account before adding recurring items."
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
