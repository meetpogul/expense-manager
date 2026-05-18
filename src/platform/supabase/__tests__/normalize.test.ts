import { describe, expect, it } from "vitest";

import { numberFromNumeric } from "../normalize";

describe("Supabase numeric normalization", () => {
  it("normalizes numeric strings, numbers, null, and undefined", () => {
    expect(numberFromNumeric("1200.50")).toBe(1200.5);
    expect(numberFromNumeric(450)).toBe(450);
    expect(numberFromNumeric(null)).toBe(0);
    expect(numberFromNumeric(undefined)).toBe(0);
  });
});
