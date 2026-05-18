import Link from "next/link";
import { PauseCircleIcon, PlayCircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import {
  BUDGET_PERIOD_LABELS,
  BUDGET_STATUS_LABELS,
} from "@/features/budgets/domain/constants";
import { clampProgressPercent } from "@/features/budgets/domain/usage";
import { setBudgetActiveAction } from "@/features/budgets/server/actions";
import {
  formatCurrency,
  formatDate,
} from "@/features/transactions/domain/format";
import { cn } from "@/lib/utils";

import type {
  BudgetDetail as BudgetDetailType,
  BudgetStatus,
} from "@/features/budgets/domain/types";

type BudgetDetailProps = {
  budget: BudgetDetailType;
};

const statusClasses: Record<BudgetStatus, string> = {
  safe: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  alert: "bg-destructive/10 text-destructive border-destructive/20",
};

const barClasses: Record<BudgetStatus, string> = {
  safe: "bg-primary",
  warning: "bg-amber-500",
  alert: "bg-destructive",
};

export function BudgetDetail({ budget }: BudgetDetailProps) {
  const progress = clampProgressPercent(budget.usage.percentUsed);

  return (
    <div className="flex flex-col gap-6">
      <section className="border-border/80 bg-card rounded-lg border p-5 shadow-sm shadow-black/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-normal">
                {budget.categories?.name ?? "Overall spending"}
              </h1>
              <Badge
                className={
                  budget.is_active
                    ? statusClasses[budget.usage.status]
                    : undefined
                }
              >
                {budget.is_active
                  ? BUDGET_STATUS_LABELS[budget.usage.status]
                  : "Paused"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {BUDGET_PERIOD_LABELS[budget.period]} budget from{" "}
              {formatDate(budget.usage.window.from)} to{" "}
              {formatDate(budget.usage.window.to)}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={setBudgetActiveAction}>
              <input name="id" type="hidden" value={budget.id} />
              <input
                name="isActive"
                type="hidden"
                value={budget.is_active ? "false" : "true"}
              />
              <Button size="sm" type="submit" variant="outline">
                {budget.is_active ? (
                  <PauseCircleIcon data-icon="inline-start" />
                ) : (
                  <PlayCircleIcon data-icon="inline-start" />
                )}
                {budget.is_active ? "Pause" : "Resume"}
              </Button>
            </form>
            <Button asChild size="sm" variant="outline">
              <Link href={`/budgets?edit=${budget.id}`}>Edit</Link>
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Used" value={formatCurrency(budget.usage.spent)} />
          <Metric
            label={budget.usage.remaining >= 0 ? "Remaining" : "Over"}
            value={formatCurrency(Math.abs(budget.usage.remaining))}
          />
          <Metric label="Limit" value={formatCurrency(budget.amount)} />
        </div>
        <p className="text-muted-foreground mt-3 text-sm tabular-nums">
          {Math.round(budget.usage.percentUsed)}% used
        </p>
        <div className="bg-muted mt-5 h-3 overflow-hidden rounded-full">
          <div
            aria-label={`${Math.round(budget.usage.percentUsed)}% used`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(progress)}
            className={cn(
              "h-full rounded-full",
              barClasses[budget.usage.status],
            )}
            role="progressbar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Related transactions</h2>
        {budget.transactions.length > 0 ? (
          <div className="border-border/80 bg-card overflow-hidden rounded-lg border shadow-sm shadow-black/5">
            {budget.transactions.map((transaction) => (
              <div
                className="border-border/70 flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                key={transaction.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {transaction.merchant_name ||
                      transaction.note ||
                      transaction.categories?.name ||
                      "Transaction"}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {formatDate(transaction.date)}
                    {transaction.accounts?.name
                      ? ` - ${transaction.accounts.name}`
                      : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            description="Matching expenses for this budget period will appear here."
            title="No related spending"
          />
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-3 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
