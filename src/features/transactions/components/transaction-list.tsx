import Link from "next/link";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { deleteTransactionAction } from "@/features/transactions/server/actions";
import {
  formatCurrency,
  formatTransactionGroupDate,
} from "@/features/transactions/domain/format";
import { cn } from "@/lib/utils";

import type { Transaction } from "@/features/transactions/domain/types";

type TransactionListProps = {
  transactions: Transaction[];
  compact?: boolean;
};

export function TransactionList({
  transactions,
  compact = false,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Empty
        description="Add one transaction and this becomes useful immediately."
        title="No transactions yet"
      />
    );
  }

  const groups = transactions.reduce<Record<string, Transaction[]>>(
    (grouped, transaction) => {
      grouped[transaction.date] ??= [];
      grouped[transaction.date].push(transaction);
      return grouped;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(groups).map(([date, rows]) => (
        <section className="flex flex-col gap-2" key={date}>
          {!compact ? (
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-normal">
              {formatTransactionGroupDate(date)}
            </p>
          ) : null}
          <div className="border-border/80 bg-card overflow-hidden rounded-lg border shadow-sm shadow-black/5">
            {rows.map((transaction) => {
              const isIncome = transaction.type === "income";
              const Icon = isIncome ? ArrowDownLeftIcon : ArrowUpRightIcon;

              return (
                <div
                  className="border-border/70 flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                  key={transaction.id}
                >
                  <div
                    className={cn(
                      "bg-secondary text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg",
                      isIncome && "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {transaction.merchant_name ||
                          transaction.note ||
                          transaction.categories?.name ||
                          "Transaction"}
                      </p>
                      {transaction.categories?.name ? (
                        <Badge className="hidden sm:inline-flex">
                          {transaction.categories.name}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {transaction.accounts?.name ?? "Account"} -{" "}
                      {transaction.note ?? transaction.date}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p
                      className={cn(
                        "text-right text-sm font-semibold tabular-nums",
                        isIncome ? "text-primary" : "text-foreground",
                      )}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    {!compact ? (
                      <div className="hidden items-center gap-1 sm:flex">
                        <Button asChild size="icon" variant="ghost">
                          <Link
                            aria-label="Edit transaction"
                            href={`/transactions/${transaction.id}/edit`}
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <form action={deleteTransactionAction}>
                          <input
                            name="id"
                            type="hidden"
                            value={transaction.id}
                          />
                          <Button
                            aria-label="Delete transaction"
                            size="icon"
                            type="submit"
                            variant="ghost"
                          >
                            <Trash2Icon />
                          </Button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
