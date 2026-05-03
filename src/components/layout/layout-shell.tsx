import type { ReactNode } from "react";
import { LayoutGridIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type LayoutShellProps = {
  children: ReactNode;
  className?: string;
};

export function LayoutShell({ children, className }: LayoutShellProps) {
  return (
    <main className={cn("min-h-svh bg-background text-foreground", className)}>
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-10 px-6 py-8 md:px-8">
        <header className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <LayoutGridIcon data-icon="inline-start" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">PWA Starter</span>
            <span className="text-muted-foreground text-xs">
              App Router foundation
            </span>
          </div>
        </header>
        <div className="flex flex-1 items-center">{children}</div>
      </div>
    </main>
  );
}
