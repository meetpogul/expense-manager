import { describe, expect, it } from "vitest";

import {
  calculateBudgetUsage,
  clampProgressPercent,
  getBudgetPeriodWindow,
  getBudgetStatus,
  sortBudgetsForAttention,
  transactionAppliesToBudget,
} from "../usage";

import type { Budget } from "../types";
import type { Transaction } from "@/features/transactions/domain/types";

const budget: Budget = {
  id: "budget-food",
  user_id: "user-1",
  category_id: "food",
  amount: 1000,
  period: "monthly",
  start_date: "2026-01-10",
  end_date: null,
  is_active: true,
  created_at: "2026-01-10T00:00:00.000Z",
  updated_at: "2026-01-10T00:00:00.000Z",
  deleted_at: null,
};

function transaction(
  id: string,
  overrides: Partial<Transaction> = {},
): Transaction {
  return {
    id,
    user_id: "user-1",
    account_id: "cash",
    category_id: "food",
    type: "expense",
    amount: 250,
    note: null,
    merchant_name: null,
    date: "2026-05-12",
    time: null,
    payment_method: null,
    created_at: "2026-05-12T00:00:00.000Z",
    updated_at: "2026-05-12T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("budget usage", () => {
  it("uses the current monthly window anchored to the budget start date", () => {
    expect(getBudgetPeriodWindow(budget, "2026-05-18")).toEqual({
      from: "2026-05-10",
      to: "2026-06-09",
    });
  });

  it("caps the active period by the budget end date", () => {
    expect(
      getBudgetPeriodWindow(
        { ...budget, end_date: "2026-05-31" },
        "2026-05-18",
      ),
    ).toEqual({
      from: "2026-05-10",
      to: "2026-05-31",
    });
  });

  it("supports weekly windows anchored to the start date", () => {
    expect(
      getBudgetPeriodWindow(
        { ...budget, period: "weekly", start_date: "2026-05-01" },
        "2026-05-18",
      ),
    ).toEqual({
      from: "2026-05-15",
      to: "2026-05-21",
    });
  });

  it("keeps monthly windows anchored for end-of-month start dates", () => {
    expect(
      getBudgetPeriodWindow(
        { ...budget, start_date: "2026-01-31" },
        "2026-03-15",
      ),
    ).toEqual({
      from: "2026-02-28",
      to: "2026-03-30",
    });

    expect(
      getBudgetPeriodWindow(
        { ...budget, start_date: "2026-01-31" },
        "2026-03-31",
      ),
    ).toEqual({
      from: "2026-03-31",
      to: "2026-04-29",
    });
  });

  it("handles yearly leap-day windows", () => {
    expect(
      getBudgetPeriodWindow(
        { ...budget, period: "yearly", start_date: "2024-02-29" },
        "2025-03-01",
      ),
    ).toEqual({
      from: "2025-02-28",
      to: "2026-02-27",
    });
  });

  it("classifies thresholds with 80 and 100 percent boundaries", () => {
    expect(getBudgetStatus(79.99)).toBe("safe");
    expect(getBudgetStatus(80)).toBe("warning");
    expect(getBudgetStatus(99.99)).toBe("warning");
    expect(getBudgetStatus(100)).toBe("alert");
  });

  it("calculates spent, remaining, percent, and status", () => {
    const usage = calculateBudgetUsage(
      budget,
      [
        transaction("in-window"),
        transaction("wrong-category", { category_id: "transport" }),
        transaction("income", { type: "income" }),
        transaction("old", { date: "2026-04-30" }),
        transaction("deleted", { deleted_at: "2026-05-13T00:00:00.000Z" }),
        transaction("second", { amount: 600 }),
      ],
      "2026-05-18",
    );

    expect(usage.spent).toBe(850);
    expect(usage.remaining).toBe(150);
    expect(usage.percentUsed).toBe(85);
    expect(usage.status).toBe("warning");
  });

  it("applies overall budgets to every expense category", () => {
    const window = getBudgetPeriodWindow(budget, "2026-05-18");

    expect(
      transactionAppliesToBudget(
        { ...budget, category_id: null },
        transaction("transport", { category_id: "transport" }),
        window,
      ),
    ).toBe(true);
  });

  it("clamps progress for rendering without hiding over-budget state", () => {
    expect(clampProgressPercent(-10)).toBe(0);
    expect(clampProgressPercent(55)).toBe(55);
    expect(clampProgressPercent(140)).toBe(100);
  });

  it("sorts active critical budgets before safe and paused budgets", () => {
    const safe = {
      ...budget,
      id: "safe",
      usage: {
        percentUsed: 20,
        remaining: 800,
        spent: 200,
        status: "safe" as const,
        window: { from: "2026-05-01", to: "2026-05-31" },
      },
    };
    const alert = {
      ...safe,
      id: "alert",
      usage: { ...safe.usage, percentUsed: 110, status: "alert" as const },
    };
    const pausedWarning = {
      ...safe,
      id: "paused",
      is_active: false,
      usage: { ...safe.usage, percentUsed: 90, status: "warning" as const },
    };

    expect(sortBudgetsForAttention([safe, pausedWarning, alert])).toEqual([
      alert,
      safe,
      pausedWarning,
    ]);
  });

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("transaction exactly on window.from boundary is included", () => {
    const window = { from: "2026-05-10", to: "2026-06-09" };
    expect(
      transactionAppliesToBudget(
        budget,
        transaction("t1", { date: "2026-05-10" }),
        window,
      ),
    ).toBe(true);
  });

  it("transaction exactly on window.to boundary is included", () => {
    const window = { from: "2026-05-10", to: "2026-06-09" };
    expect(
      transactionAppliesToBudget(
        budget,
        transaction("t1", { date: "2026-06-09" }),
        window,
      ),
    ).toBe(true);
  });

  it("transaction one day before window.from is excluded", () => {
    const window = { from: "2026-05-10", to: "2026-06-09" };
    expect(
      transactionAppliesToBudget(
        budget,
        transaction("t1", { date: "2026-05-09" }),
        window,
      ),
    ).toBe(false);
  });

  it("deleted transaction is always excluded", () => {
    const window = { from: "2026-05-10", to: "2026-06-09" };
    expect(
      transactionAppliesToBudget(
        budget,
        transaction("t1", { deleted_at: "2026-05-12T00:00:00.000Z" }),
        window,
      ),
    ).toBe(false);
  });

  it("income transaction is excluded even if it matches category and window", () => {
    const window = { from: "2026-05-10", to: "2026-06-09" };
    expect(
      transactionAppliesToBudget(
        budget,
        transaction("t1", { type: "income" }),
        window,
      ),
    ).toBe(false);
  });

  it("null category_id budget matches all expense categories", () => {
    const window = { from: "2026-05-10", to: "2026-06-09" };
    const overall = { ...budget, category_id: null };

    expect(
      transactionAppliesToBudget(
        overall,
        transaction("t1", { category_id: "food" }),
        window,
      ),
    ).toBe(true);
    expect(
      transactionAppliesToBudget(
        overall,
        transaction("t2", { category_id: "travel" }),
        window,
      ),
    ).toBe(true);
  });

  it("clampProgressPercent at boundary values: 0 and 100", () => {
    expect(clampProgressPercent(0)).toBe(0);
    expect(clampProgressPercent(100)).toBe(100);
  });

  it("calculateBudgetUsage with zero budget amount produces zero percentUsed", () => {
    const usage = calculateBudgetUsage(
      { ...budget, amount: 0 },
      [transaction("t1")],
      "2026-05-18",
    );
    expect(usage.percentUsed).toBe(0);
  });

  it("sortBudgetsForAttention: two active budgets with same status sorted by percentUsed desc", () => {
    const base = {
      ...budget,
      usage: {
        spent: 0,
        remaining: 1000,
        status: "warning" as const,
        window: { from: "2026-05-10", to: "2026-06-09" },
      },
    };
    const high = {
      ...base,
      id: "high",
      usage: { ...base.usage, percentUsed: 95 },
    };
    const low = {
      ...base,
      id: "low",
      usage: { ...base.usage, percentUsed: 82 },
    };

    const sorted = sortBudgetsForAttention([low, high]);
    expect(sorted[0].id).toBe("high");
    expect(sorted[1].id).toBe("low");
  });
});
