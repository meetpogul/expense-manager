import { describe, expect, it } from "vitest";
import { parseTransactionFilters } from "../use-transaction-filters";

describe("parseTransactionFilters", () => {
  it("returns empty object for empty input", () => {
    const filters = parseTransactionFilters({});
    expect(filters).toEqual({});
  });

  it("filters out 'all' values for type and category", () => {
    const filters = parseTransactionFilters({
      type: "all",
      category: "all",
    });
    expect(filters).toEqual({});
  });

  it("passes through valid type and categoryId", () => {
    const filters = parseTransactionFilters({
      type: "expense",
      category: "cat-1",
    });
    expect(filters).toEqual({
      type: "expense",
      categoryId: "cat-1",
    });
  });

  it("passes through from and to dates", () => {
    const filters = parseTransactionFilters({
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(filters).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
  });

  it("mixes all valid parameters correctly", () => {
    const filters = parseTransactionFilters({
      type: "income",
      category: "salary-1",
      from: "2026-01-01",
      to: "2026-12-31",
      ignored: "should-not-be-here", // Just testing what happens with extra keys; currently the function doesn't pick them up
    });
    expect(filters).toEqual({
      type: "income",
      categoryId: "salary-1",
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });
});
