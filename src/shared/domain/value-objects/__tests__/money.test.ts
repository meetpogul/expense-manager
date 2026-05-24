import { describe, expect, it } from "vitest";
import { Money } from "../money";
import { DomainError } from "../../domain-error";

describe("Money", () => {
  it("zero() creates Money with 0 amount", () => {
    const m = Money.zero();
    expect(m.amount).toBe(0);
  });

  describe("from()", () => {
    it("creates Money from a number", () => {
      const m = Money.from(100);
      expect(m.amount).toBe(100);
    });

    it("creates Money from a string without commas", () => {
      const m = Money.from("500");
      expect(m.amount).toBe(500);
    });

    it("creates Money from a string with commas", () => {
      const m = Money.from("1,500.50");
      expect(m.amount).toBe(1500.5);
    });

    it("throws DomainError for invalid inputs", () => {
      expect(() => Money.from("abc")).toThrow(DomainError);
      expect(() => Money.from("abc")).toThrow("Money amount must be finite.");
      expect(() => Money.from(NaN)).toThrow(DomainError);
    });
  });

  describe("positive()", () => {
    it("creates Money for positive amounts", () => {
      const m = Money.positive(50);
      expect(m.amount).toBe(50);
    });

    it("throws DomainError for zero", () => {
      expect(() => Money.positive(0)).toThrow(DomainError);
      expect(() => Money.positive(0)).toThrow(
        "Money amount must be greater than 0.",
      );
    });

    it("throws DomainError for negative amounts", () => {
      expect(() => Money.positive(-10)).toThrow(DomainError);
    });
  });

  it("add() adds two Money instances", () => {
    const m1 = Money.from(100);
    const m2 = Money.from(50);
    const result = m1.add(m2);
    expect(result.amount).toBe(150);
  });

  it("subtract() subtracts one Money from another", () => {
    const m1 = Money.from(100);
    const m2 = Money.from(30);
    const result = m1.subtract(m2);
    expect(result.amount).toBe(70);
  });

  it("negate() negates the amount", () => {
    const m = Money.from(100);
    const result = m.negate();
    expect(result.amount).toBe(-100);
  });

  it("equals() returns true if amounts match", () => {
    const m1 = Money.from(100);
    const m2 = Money.from(100);
    const m3 = Money.from(50);

    expect(m1.equals(m2)).toBe(true);
    expect(m1.equals(m3)).toBe(false);
  });

  it("format() returns formatted currency string", () => {
    const m = Money.from(1500);
    const formatted = m.format();
    // we use a generic match since the exact locale output depends on Node.js / constants
    // INR output should have the currency symbol and 1,500 structure.
    expect(formatted).toMatch(/1,500/);
  });
});
