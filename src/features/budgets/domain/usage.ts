import { BUDGET_ALERT_THRESHOLD, BUDGET_WARNING_THRESHOLD } from "./constants";

import type {
  Budget,
  BudgetPeriod,
  BudgetPeriodWindow,
  BudgetStatus,
  BudgetUsage,
  BudgetWithUsage,
} from "./types";
import type { Transaction } from "@/features/transactions/domain/types";

const dayMs = 24 * 60 * 60 * 1000;
const statusPriority: Record<BudgetStatus, number> = {
  alert: 0,
  warning: 1,
  safe: 2,
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function addMonthsClamped(anchor: Date, monthsToAdd: number) {
  const targetMonth = anchor.getUTCMonth() + monthsToAdd;
  const targetStart = new Date(
    Date.UTC(anchor.getUTCFullYear(), targetMonth, 1),
  );
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetStart.getUTCFullYear(), targetStart.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(anchor.getUTCDate(), lastDayOfTargetMonth);

  return new Date(
    Date.UTC(
      targetStart.getUTCFullYear(),
      targetStart.getUTCMonth(),
      targetDay,
    ),
  );
}

function addPeriodFromAnchor(
  anchor: Date,
  period: BudgetPeriod,
  periodsToAdd: number,
) {
  if (period === "weekly") {
    return new Date(anchor.getTime() + periodsToAdd * 7 * dayMs);
  }

  if (period === "monthly") {
    return addMonthsClamped(anchor, periodsToAdd);
  }

  return addMonthsClamped(anchor, periodsToAdd * 12);
}

export function getBudgetPeriodWindow(
  budget: Pick<Budget, "period" | "start_date" | "end_date">,
  todayKey = dateKey(new Date()),
): BudgetPeriodWindow {
  const today = dateFromKey(todayKey);
  const anchor = dateFromKey(budget.start_date);
  let periodsElapsed = 0;

  while (
    addPeriodFromAnchor(anchor, budget.period, periodsElapsed + 1) <= today
  ) {
    periodsElapsed += 1;
  }

  const from = addPeriodFromAnchor(anchor, budget.period, periodsElapsed);
  const next = addPeriodFromAnchor(anchor, budget.period, periodsElapsed + 1);
  const periodEnd = new Date(next.getTime() - dayMs);
  const cappedEnd = budget.end_date
    ? new Date(
        Math.min(periodEnd.getTime(), dateFromKey(budget.end_date).getTime()),
      )
    : periodEnd;

  return {
    from: dateKey(from),
    to: dateKey(cappedEnd),
  };
}

export function getBudgetStatus(percentUsed: number): BudgetStatus {
  if (percentUsed >= BUDGET_ALERT_THRESHOLD) {
    return "alert";
  }

  if (percentUsed >= BUDGET_WARNING_THRESHOLD) {
    return "warning";
  }

  return "safe";
}

export function transactionAppliesToBudget(
  budget: Pick<Budget, "category_id">,
  transaction: Pick<
    Transaction,
    "type" | "category_id" | "date" | "deleted_at"
  >,
  window: BudgetPeriodWindow,
) {
  if (transaction.deleted_at) {
    return false;
  }

  if (transaction.type !== "expense") {
    return false;
  }

  if (transaction.date < window.from || transaction.date > window.to) {
    return false;
  }

  return budget.category_id
    ? transaction.category_id === budget.category_id
    : true;
}

export function calculateBudgetUsage(
  budget: Pick<
    Budget,
    "amount" | "category_id" | "period" | "start_date" | "end_date"
  >,
  transactions: Transaction[],
  todayKey?: string,
): BudgetUsage {
  const window = getBudgetPeriodWindow(budget, todayKey);
  const spent = transactions
    .filter((transaction) =>
      transactionAppliesToBudget(budget, transaction, window),
    )
    .reduce((total, transaction) => total + transaction.amount, 0);
  const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  return {
    spent,
    remaining: budget.amount - spent,
    percentUsed,
    status: getBudgetStatus(percentUsed),
    window,
  };
}

export function clampProgressPercent(percentUsed: number) {
  return Math.min(Math.max(percentUsed, 0), 100);
}

export function sortBudgetsForAttention(budgets: BudgetWithUsage[]) {
  return [...budgets].sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1;
    }

    if (left.usage.status !== right.usage.status) {
      return (
        statusPriority[left.usage.status] - statusPriority[right.usage.status]
      );
    }

    return right.usage.percentUsed - left.usage.percentUsed;
  });
}
