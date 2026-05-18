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
});
