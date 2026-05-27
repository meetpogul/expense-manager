import { describe, expect, it } from "vitest";

import type { Account } from "@/features/accounts/domain/types";
import type { Transaction } from "@/features/transactions/domain/types";
import { getDashboardSummary } from "../queries";

describe("Dashboard Queries", () => {
  const monthKey = new Date().toISOString().slice(0, 7);

  const accounts: Account[] = [
    {
      id: "acc-1",
      user_id: "user-1",
      name: "Cash",
      type: "cash",
      balance: 1000,
      color: null,
      icon: null,
      is_default: true,
      is_active: true,
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
      deleted_at: null,
    },
    {
      id: "acc-2",
      user_id: "user-1",
      name: "Bank",
      type: "bank",
      balance: 5000,
      color: null,
      icon: null,
      is_default: false,
      is_active: true,
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
      deleted_at: null,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "tx-1",
      user_id: "user-1",
      account_id: "acc-1",
      category_id: "cat-1",
      type: "expense",
      amount: 1000,
      note: null,
      merchant_name: null,
      date: `${monthKey}-10`,
      time: null,
      payment_method: null,
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
      deleted_at: null,
      accounts: { id: "acc-1", name: "Cash", type: "cash" },
      categories: {
        id: "cat-1",
        name: "Food",
        icon: null,
        color: null,
        type: "expense",
      },
    },
    {
      id: "tx-2",
      user_id: "user-1",
      account_id: "acc-2",
      category_id: null,
      type: "income",
      amount: 2500,
      note: null,
      merchant_name: null,
      date: `${monthKey}-12`,
      time: null,
      payment_method: null,
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
      deleted_at: null,
      accounts: { id: "acc-2", name: "Bank", type: "bank" },
      categories: null,
    },
    {
      id: "tx-old",
      user_id: "user-1",
      account_id: "acc-1",
      category_id: "cat-1",
      type: "expense",
      amount: 500,
      note: null,
      merchant_name: null,
      date: "2025-01-01", // Not in current month
      time: null,
      payment_method: null,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
      deleted_at: null,
      accounts: { id: "acc-1", name: "Cash", type: "cash" },
      categories: {
        id: "cat-1",
        name: "Food",
        icon: null,
        color: null,
        type: "expense",
      },
    },
  ];

  it("calculates summary with mixed income and expense for the current month", () => {
    const summary = getDashboardSummary(accounts, transactions);

    // Total balance should sum all accounts
    expect(summary.totalBalance).toBe(6000); // 1000 + 5000

    // Only current month tx-1 (1000 expense) and tx-2 (2500 income)
    expect(summary.monthlyIncome).toBe(2500);
    expect(summary.monthlyExpense).toBe(1000);
  });

  it("handles zero transactions for the current period", () => {
    const summary = getDashboardSummary(accounts, [transactions[2]!]); // Only old tx

    expect(summary.totalBalance).toBe(6000);
    expect(summary.monthlyIncome).toBe(0);
    expect(summary.monthlyExpense).toBe(0);
  });

  it("handles empty accounts and transactions", () => {
    const summary = getDashboardSummary([], []);

    expect(summary.totalBalance).toBe(0);
    expect(summary.monthlyIncome).toBe(0);
    expect(summary.monthlyExpense).toBe(0);
  });
});
