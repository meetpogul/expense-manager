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
});
