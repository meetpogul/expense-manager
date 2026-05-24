import { describe, expect, it } from "vitest";

import {
  advanceRecurringDueDate,
  isRecurringRuleActiveAfterAdvance,
  isRecurringRuleDue,
} from "../schedule";

describe("recurring schedule", () => {
  it("advances due dates by each supported frequency", () => {
    expect(advanceRecurringDueDate("2026-05-18", "daily")).toBe("2026-05-19");
    expect(advanceRecurringDueDate("2026-05-18", "weekly")).toBe("2026-05-25");
    expect(advanceRecurringDueDate("2026-05-18", "biweekly")).toBe(
      "2026-06-01",
    );
    expect(advanceRecurringDueDate("2026-01-31", "monthly")).toBe("2026-02-28");
    expect(advanceRecurringDueDate("2026-11-30", "quarterly")).toBe(
      "2027-02-28",
    );
    expect(advanceRecurringDueDate("2024-02-29", "yearly")).toBe("2025-02-28");
  });

  it("detects due active rules only", () => {
    expect(
      isRecurringRuleDue(
        { is_active: true, next_due_date: "2026-05-18" },
        "2026-05-18",
      ),
    ).toBe(true);
    expect(
      isRecurringRuleDue(
        { is_active: false, next_due_date: "2026-05-18" },
        "2026-05-18",
      ),
    ).toBe(false);
    expect(
      isRecurringRuleDue(
        { is_active: true, next_due_date: "2026-05-19" },
        "2026-05-18",
      ),
    ).toBe(false);
  });

  it("deactivates rules after the advanced date passes the end date", () => {
    expect(isRecurringRuleActiveAfterAdvance("2026-06-01", null)).toBe(true);
    expect(isRecurringRuleActiveAfterAdvance("2026-06-01", "2026-06-01")).toBe(
      true,
    );
    expect(isRecurringRuleActiveAfterAdvance("2026-06-02", "2026-06-01")).toBe(
      false,
    );
  });

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("leap year: Feb 29 daily → Mar 1", () => {
    expect(advanceRecurringDueDate("2024-02-29", "daily")).toBe("2024-03-01");
  });

  it("leap year monthly: Jan 31 → Feb 29 in a leap year", () => {
    // 2024 is a leap year
    expect(advanceRecurringDueDate("2024-01-31", "monthly")).toBe("2024-02-29");
  });

  it("isRecurringRuleDue uses <= (same-day due date is due)", () => {
    // A rule with next_due_date == today should be due
    expect(
      isRecurringRuleDue(
        { is_active: true, next_due_date: "2026-05-18" },
        "2026-05-18",
      ),
    ).toBe(true);
    // A rule with next_due_date == yesterday is also due (overdue)
    expect(
      isRecurringRuleDue(
        { is_active: true, next_due_date: "2026-05-17" },
        "2026-05-18",
      ),
    ).toBe(true);
  });

  it("isRecurringRuleActiveAfterAdvance: same-day end date keeps rule active", () => {
    // next == end → still active (rule: nextDueDate <= endDate)
    expect(isRecurringRuleActiveAfterAdvance("2026-07-01", "2026-07-01")).toBe(
      true,
    );
  });

  it("quarterly advance from Aug 31 → Nov 30 (month-end clamp)", () => {
    expect(advanceRecurringDueDate("2026-08-31", "quarterly")).toBe(
      "2026-11-30",
    );
  });

  it("biweekly advance is always exactly 14 days", () => {
    expect(advanceRecurringDueDate("2026-03-01", "biweekly")).toBe(
      "2026-03-15",
    );
    expect(advanceRecurringDueDate("2026-03-15", "biweekly")).toBe(
      "2026-03-29",
    );
  });

  it("yearly advance: Dec 31 → Dec 31 next year", () => {
    expect(advanceRecurringDueDate("2026-12-31", "yearly")).toBe("2027-12-31");
  });

  it("monthly advance crosses year boundary: Dec → Jan", () => {
    expect(advanceRecurringDueDate("2026-12-15", "monthly")).toBe("2027-01-15");
  });
});
