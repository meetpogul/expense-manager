import type { ReactNode } from "react";
import { LogOutIcon, PlusIcon, WalletCardsIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/server/actions";

import { AppNav } from "./app-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="bg-background text-foreground min-h-svh">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 md:px-8 md:py-6">
        <header className="border-border/80 bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-10 -mx-4 flex flex-col gap-4 border-b px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3" href="/">
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
                <WalletCardsIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Expense Manager</span>
                <span className="text-muted-foreground text-xs">
                  Personal tracking
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild className="hidden sm:inline-flex" size="sm">
                <Link href="/transactions">
                  <PlusIcon data-icon="inline-start" />
                  Add
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button
                  aria-label="Sign out"
                  size="icon"
                  type="submit"
                  variant="ghost"
                >
                  <LogOutIcon />
                </Button>
              </form>
            </div>
          </div>
          <AppNav />
        </header>
        {children}
      </div>
    </main>
  );
}
