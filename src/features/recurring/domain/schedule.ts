import type { RecurringFrequency, RecurringRule } from "./types";

const dayMs = 24 * 60 * 60 * 1000;

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * dayMs);
}

function addMonthsClamped(date: Date, monthsToAdd: number) {
  const targetMonth = date.getUTCMonth() + monthsToAdd;
  const targetStart = new Date(Date.UTC(date.getUTCFullYear(), targetMonth, 1));
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetStart.getUTCFullYear(), targetStart.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(date.getUTCDate(), lastDayOfTargetMonth);

  return new Date(
    Date.UTC(
      targetStart.getUTCFullYear(),
      targetStart.getUTCMonth(),
      targetDay,
    ),
  );
}

export function advanceRecurringDueDate(
  dueDate: string,
  frequency: RecurringFrequency,
) {
  const date = dateFromKey(dueDate);

  if (frequency === "daily") {
    return dateKey(addDays(date, 1));
  }

  if (frequency === "weekly") {
    return dateKey(addDays(date, 7));
  }

  if (frequency === "biweekly") {
    return dateKey(addDays(date, 14));
  }

  if (frequency === "monthly") {
    return dateKey(addMonthsClamped(date, 1));
  }

  if (frequency === "quarterly") {
    return dateKey(addMonthsClamped(date, 3));
  }

  return dateKey(addMonthsClamped(date, 12));
}

export function isRecurringRuleDue(
  rule: Pick<RecurringRule, "is_active" | "next_due_date">,
  todayKey = dateKey(new Date()),
) {
  return rule.is_active && rule.next_due_date <= todayKey;
}

export function isRecurringRuleActiveAfterAdvance(
  nextDueDate: string,
  endDate: string | null,
) {
  return !endDate || nextDueDate <= endDate;
}
