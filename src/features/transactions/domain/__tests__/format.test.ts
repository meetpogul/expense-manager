import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatTransactionGroupDate,
  todayInputValue,
} from "../format";

describe("transaction formatters", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats INR currency and compact currency", () => {
    expect(formatCurrency(125000)).toContain("1,25,000");
    expect(formatCompactCurrency(125000)).toContain("1.3L");
  });

  it("formats dates and transaction groups", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T08:00:00.000Z"));

    expect(formatDate("2026-05-01")).toContain("1 May 2026");
    expect(formatTransactionGroupDate("2026-05-18")).toBe("Today");
    expect(formatTransactionGroupDate("2026-05-17")).toContain("17 May");
    expect(todayInputValue()).toBe("2026-05-18");
  });
});
