import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "income" | "expense";
  icon?: ReactNode;
};

export function SummaryCard({
  label,
  value,
  detail,
  tone = "default",
  icon,
}: SummaryCardProps) {
  return (
    <div className="border-border/80 bg-card flex min-h-28 flex-col justify-between rounded-lg border p-4 shadow-sm shadow-black/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{label}</p>
        {icon ? (
          <div
            className={cn(
              "bg-secondary text-muted-foreground flex size-8 items-center justify-center rounded-md",
              tone === "income" && "bg-primary/10 text-primary",
              tone === "expense" && "bg-destructive/10 text-destructive",
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold tracking-normal">{value}</p>
        {detail ? (
          <p className="text-muted-foreground text-xs">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}
