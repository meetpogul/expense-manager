import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function Empty({ title, description, action, className }: EmptyProps) {
  return (
    <div
      className={cn(
        "border-border/80 bg-muted/20 flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground max-w-sm text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
