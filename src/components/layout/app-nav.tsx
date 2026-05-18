"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClockIcon,
  FolderIcon,
  HomeIcon,
  ListIcon,
  PiggyBankIcon,
  SettingsIcon,
  WalletCardsIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/transactions", label: "Transactions", icon: ListIcon },
  { href: "/accounts", label: "Accounts", icon: WalletCardsIcon },
  { href: "/budgets", label: "Budgets", icon: PiggyBankIcon },
  { href: "/recurring", label: "Recurring", icon: CalendarClockIcon },
  { href: "/categories", label: "Categories", icon: FolderIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto md:overflow-visible"
      aria-label="Main"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              active && "bg-secondary text-foreground",
            )}
            href={item.href}
            key={item.href}
          >
            <Icon />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
