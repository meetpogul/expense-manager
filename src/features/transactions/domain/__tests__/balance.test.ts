import { describe, expect, it } from "vitest";

import {
  editBalanceDelta,
  nextBalance,
  reversalEffect,
  transactionEffect,
} from "../balance";

describe("balance helpers", () => {
  it("applies income and expense effects", () => {
    expect(transactionEffect("income", 5000)).toBe(5000);
    expect(transactionEffect("expense", 1200)).toBe(-1200);
  });

  it("reverses a previous transaction", () => {
    expect(reversalEffect("income", 5000)).toBe(-5000);
    expect(reversalEffect("expense", 1200)).toBe(1200);
  });

  it("computes the next account balance", () => {
    expect(nextBalance(10000, "income", 2500)).toBe(12500);
    expect(nextBalance(10000, "expense", 750)).toBe(9250);
  });

  it("computes the net delta for an edit on the same account", () => {
    expect(
      editBalanceDelta(
        { type: "expense", amount: 500 },
        { type: "expense", amount: 700 },
      ),
    ).toBe(-200);
    expect(
      editBalanceDelta(
        { type: "expense", amount: 500 },
        { type: "income", amount: 700 },
      ),
    ).toBe(1200);
  });

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("transactionEffect with zero amount returns zero", () => {
    expect(transactionEffect("income", 0)).toBe(0);
    expect(transactionEffect("expense", 0)).toBe(-0);
  });

  it("nextBalance with zero amount leaves balance unchanged", () => {
    expect(nextBalance(5000, "income", 0)).toBe(5000);
    expect(nextBalance(5000, "expense", 0)).toBe(5000);
  });

  it("editBalanceDelta returns 0 for identical type and amount", () => {
    expect(
      editBalanceDelta(
        { type: "expense", amount: 300 },
        { type: "expense", amount: 300 },
      ),
    ).toBe(0);
    expect(
      editBalanceDelta(
        { type: "income", amount: 1000 },
        { type: "income", amount: 1000 },
      ),
    ).toBe(0);
  });

  it("editBalanceDelta income-to-income with changed amount", () => {
    // was income 1000, now income 1500 → net +500
    expect(
      editBalanceDelta(
        { type: "income", amount: 1000 },
        { type: "income", amount: 1500 },
      ),
    ).toBe(500);
  });

  it("editBalanceDelta expense-to-income flips the sign entirely", () => {
    // reversal(expense, 200) = +200, effect(income, 300) = +300 → +500
    expect(
      editBalanceDelta(
        { type: "expense", amount: 200 },
        { type: "income", amount: 300 },
      ),
    ).toBe(500);
  });

  it("nextBalance with large numbers stays precise", () => {
    // Typical maximum amount: tens of millions
    expect(nextBalance(99_000_000, "income", 1_000_000)).toBe(100_000_000);
    expect(nextBalance(100_000_000, "expense", 1_000_000)).toBe(99_000_000);
  });
});
