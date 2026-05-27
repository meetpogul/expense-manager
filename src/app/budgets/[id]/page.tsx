import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget Details",
  description: "View detailed spending for a specific budget category.",
};

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BudgetDetail } from "@/features/budgets/components/budget-detail";
import { getBudgetById } from "@/features/budgets/server/queries";
import { getSupabaseAndUser } from "@/features/auth/server/session";

type BudgetDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BudgetDetailPage({
  params,
}: BudgetDetailPageProps) {
  const { id } = await params;
  const { supabase } = await getSupabaseAndUser();
  let budget;

  try {
    budget = await getBudgetById(supabase, id);
  } catch {
    notFound();
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <Button asChild className="w-fit" size="sm" variant="ghost">
          <Link href="/budgets">
            <ArrowLeftIcon data-icon="inline-start" />
            Budgets
          </Link>
        </Button>
        <BudgetDetail budget={budget} />
      </div>
    </AppShell>
  );
}
