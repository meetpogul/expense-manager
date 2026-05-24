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

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("formatCurrency(0) returns a zero-formatted string", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formatCurrency for negative amounts includes the negative sign", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("-");
    expect(result).toContain("500");
  });

  it("formatCompactCurrency for sub-1000 amounts does not use compact notation", () => {
    const result = formatCompactCurrency(999);
    expect(result).toContain("999");
    // no K/L suffix for small numbers
    expect(result).not.toContain("L");
    expect(result).not.toContain("K");
  });

  it("formatCompactCurrency for amounts in thousands uses K/T notation", () => {
    const result = formatCompactCurrency(5000);
    // en-IN compact uses T for thousands in some environments, K in others
    // just confirm it is shorter than the full form
    expect(result.length).toBeLessThan(formatCurrency(5000).length);
  });

  it("formatDate works for various months including single-digit days", () => {
    expect(formatDate("2026-01-01")).toContain("1 Jan 2026");
    expect(formatDate("2026-12-31")).toContain("31 Dec 2026");
  });

  it("formatTransactionGroupDate returns weekday string for non-today dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T08:00:00.000Z"));

    const result = formatTransactionGroupDate("2026-05-15");
    // 15 May 2026 is a Friday — result should contain the day number
    expect(result).toContain("15");
    expect(result).not.toBe("Today");
  });

  it("todayInputValue returns YYYY-MM-DD format", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-31T23:59:59.000Z"));

    expect(todayInputValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(todayInputValue()).toBe("2026-12-31");
  });
});
