import { afterEach, describe, expect, it, vi } from "vitest";

import { DomainError } from "../domain-error";
import { CalendarDate, EntityId, Money, UserId } from "../value-objects";

describe("shared value objects", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates and compares money immutably", () => {
    const base = Money.from("1,200");
    const next = base.add(Money.from(300));

    expect(Money.zero().amount).toBe(0);
    expect(base.amount).toBe(1200);
    expect(next.amount).toBe(1500);
    expect(next.subtract(Money.from(500)).amount).toBe(1000);
    expect(next.negate().amount).toBe(-1500);
    expect(next.equals(Money.from(1500))).toBe(true);
    expect(next.format()).toContain("1,500");
  });

  it("rejects invalid or non-positive money where required", () => {
    expect(() => Money.from(Number.NaN)).toThrow(DomainError);
    expect(() => Money.positive(0)).toThrow(DomainError);
  });

  it("validates calendar dates and compares months", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T08:00:00.000Z"));
    const date = CalendarDate.from("2026-05-18");

    expect(date.value).toBe("2026-05-18");
    expect(date.toString()).toBe("2026-05-18");
    expect(CalendarDate.today().value).toBe("2026-05-18");
    expect(date.isSameMonth(CalendarDate.from("2026-05-01"))).toBe(true);
    expect(date.isSameMonth(CalendarDate.from("2026-06-01"))).toBe(false);
    expect(() => CalendarDate.from("2026-02-30")).toThrow(DomainError);
    expect(() => CalendarDate.from("18-05-2026")).toThrow(DomainError);
  });

  it("validates typed entity ids", () => {
    const id = EntityId.create(" account-1 ", "account");
    const userId = UserId.from("user-1");

    expect(id.value).toBe("account-1");
    expect(id.toString()).toBe("account-1");
    expect(id.equals(EntityId.create("account-1", "account"))).toBe(true);
    expect(userId.value).toBe("user-1");
    expect(() => EntityId.create(" ", "account")).toThrow(DomainError);
  });
});
