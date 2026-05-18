import Link from "next/link";
import {
  EyeIcon,
  PauseCircleIcon,
  PencilIcon,
  PlayCircleIcon,
} from "lucide-react";

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
  BudgetStatus,
  BudgetWithUsage,
} from "@/features/budgets/domain/types";

type BudgetListProps = {
  budgets: BudgetWithUsage[];
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

export function BudgetList({ budgets }: BudgetListProps) {
  if (budgets.length === 0) {
    return (
      <Empty
        description="Add a category limit to see spending health at a glance."
        title="No budgets yet"
      />
    );
  }

  return (
    <div className="grid gap-3">
      {budgets.map((budget) => {
        const percent = clampProgressPercent(budget.usage.percentUsed);

        return (
          <div
            className={cn(
              "border-border/80 bg-card rounded-lg border p-4 shadow-sm shadow-black/5",
              !budget.is_active && "opacity-65",
            )}
            key={budget.id}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    {budget.categories?.name ?? "Overall spending"}
                  </h2>
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
                  <Badge>{BUDGET_PERIOD_LABELS[budget.period]}</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDate(budget.usage.window.from)} -{" "}
                  {formatDate(budget.usage.window.to)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(budget.usage.spent)} /{" "}
                    {formatCurrency(budget.amount)}
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {Math.round(budget.usage.percentUsed)}% used -{" "}
                    {budget.usage.remaining >= 0
                      ? `${formatCurrency(budget.usage.remaining)} left`
                      : `${formatCurrency(Math.abs(budget.usage.remaining))} over`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button asChild size="icon" variant="ghost">
                    <Link
                      aria-label="View budget"
                      href={`/budgets/${budget.id}`}
                    >
                      <EyeIcon />
                    </Link>
                  </Button>
                  <Button asChild size="icon" variant="ghost">
                    <Link
                      aria-label="Edit budget"
                      href={`/budgets?edit=${budget.id}`}
                    >
                      <PencilIcon />
                    </Link>
                  </Button>
                  <form action={setBudgetActiveAction}>
                    <input name="id" type="hidden" value={budget.id} />
                    <input
                      name="isActive"
                      type="hidden"
                      value={budget.is_active ? "false" : "true"}
                    />
                    <Button
                      aria-label={
                        budget.is_active ? "Pause budget" : "Resume budget"
                      }
                      size="icon"
                      type="submit"
                      variant="ghost"
                    >
                      {budget.is_active ? (
                        <PauseCircleIcon />
                      ) : (
                        <PlayCircleIcon />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
            <div className="bg-muted mt-4 h-2 overflow-hidden rounded-full">
              <div
                aria-label={`${Math.round(budget.usage.percentUsed)}% used`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(percent)}
                className={cn(
                  "h-full rounded-full",
                  barClasses[budget.usage.status],
                )}
                role="progressbar"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
