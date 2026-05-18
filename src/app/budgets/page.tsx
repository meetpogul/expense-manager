import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { BudgetList } from "@/features/budgets/components/budget-list";
import { getBudgets } from "@/features/budgets/server/queries";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { getCategories } from "@/features/categories/server/queries";

type BudgetsPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const { edit } = await searchParams;
  const { supabase } = await getSupabaseAndUser();
  const categories = await getCategories(supabase);
  const budgets = await getBudgets(supabase);
  const editingBudget = budgets.find((budget) => budget.id === edit);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">
                Budgets
              </h1>
              <p className="text-muted-foreground text-sm">
                Compare limits and spot categories that need attention.
              </p>
            </div>
            <Button asChild className="sm:hidden">
              <Link href="#add-budget">
                <PlusIcon data-icon="inline-start" />
                Add
              </Link>
            </Button>
          </div>
          <BudgetList budgets={budgets} />
        </section>
        <aside id="add-budget">
          <Card className="sticky top-36 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base">
                {editingBudget ? "Edit budget" : "Add budget"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetForm budget={editingBudget} categories={categories} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
