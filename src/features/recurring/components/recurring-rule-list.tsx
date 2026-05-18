import Link from "next/link";
import { PlayCircleIcon, PencilIcon, PauseCircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { RECURRING_FREQUENCY_LABELS } from "@/features/recurring/domain/constants";
import { isRecurringRuleDue } from "@/features/recurring/domain/schedule";
import {
  deactivateRecurringRuleAction,
  executeRecurringRuleAction,
} from "@/features/recurring/server/actions";
import {
  formatCurrency,
  formatDate,
} from "@/features/transactions/domain/format";
import { cn } from "@/lib/utils";

import type { RecurringRule } from "@/features/recurring/domain/types";

type RecurringRuleListProps = {
  rules: RecurringRule[];
  todayKey?: string;
};

export function RecurringRuleList({ rules, todayKey }: RecurringRuleListProps) {
  if (rules.length === 0) {
    return (
      <Empty
        description="Add rent, salary, subscriptions, or any repeating item."
        title="No recurring rules yet"
      />
    );
  }

  return (
    <div className="grid gap-3">
      {rules.map((rule) => {
        const isDue = isRecurringRuleDue(rule, todayKey);

        return (
          <div
            className={cn(
              "border-border/80 bg-card rounded-lg border p-4 shadow-sm shadow-black/5",
              !rule.is_active && "opacity-65",
            )}
            key={rule.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    {rule.note || rule.categories?.name || "Recurring item"}
                  </h2>
                  <Badge
                    className={
                      rule.is_active
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : undefined
                    }
                  >
                    {rule.is_active ? "Active" : "Paused"}
                  </Badge>
                  <Badge>{RECURRING_FREQUENCY_LABELS[rule.frequency]}</Badge>
                  {isDue ? (
                    <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700">
                      Due
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  {rule.accounts?.name ?? "Account"}
                  {rule.categories?.name ? ` - ${rule.categories.name}` : ""}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {rule.type === "income" ? "+" : "-"}
                    {formatCurrency(rule.amount)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Next {formatDate(rule.next_due_date)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {isDue ? (
                    <form action={executeRecurringRuleAction}>
                      <input name="id" type="hidden" value={rule.id} />
                      <Button
                        aria-label="Run due recurring rule"
                        size="icon"
                        type="submit"
                        variant="ghost"
                      >
                        <PlayCircleIcon />
                      </Button>
                    </form>
                  ) : null}
                  <Button asChild size="icon" variant="ghost">
                    <Link
                      aria-label="Edit recurring rule"
                      href={`/recurring?edit=${rule.id}`}
                    >
                      <PencilIcon />
                    </Link>
                  </Button>
                  {rule.is_active ? (
                    <form action={deactivateRecurringRuleAction}>
                      <input name="id" type="hidden" value={rule.id} />
                      <Button
                        aria-label="Pause recurring rule"
                        size="icon"
                        type="submit"
                        variant="ghost"
                      >
                        <PauseCircleIcon />
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
