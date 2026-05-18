import { describe, expect, it } from "vitest";

import { validateCategoryForm } from "../validation";

describe("Category Validation", () => {
  it("parses valid category form data", () => {
    const formData = new FormData();
    formData.set("name", "Groceries");
    formData.set("type", "expense");
    formData.set("icon", "shopping-cart");

    const result = validateCategoryForm(formData);

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Groceries",
        type: "expense",
        icon: "shopping-cart",
      },
    });
  });

  it("handles empty optional fields by coercing to null", () => {
    const formData = new FormData();
    formData.set("name", "Salary");
    formData.set("type", "income");
    formData.set("icon", "   "); // Should be trimmed and coerced to null

    const result = validateCategoryForm(formData);

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Salary",
        type: "income",
        icon: null,
      },
    });
  });

  it("returns field errors for invalid input", () => {
    const formData = new FormData();
    // Missing name, invalid type
    formData.set("name", "   "); // Should fail trim
    formData.set("type", "invalid_type");

    const result = validateCategoryForm(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toEqual({
        name: "Category name is required.",
        type: "Choose a valid category type.",
      });
    }
  });

  it("handles non-string form data values gracefully", () => {
    const formData = new FormData();
    formData.set("name", new File([""], "test.txt"));
    formData.set("type", "expense");

    const result = validateCategoryForm(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toEqual({
        name: "Category name is required.",
      });
    }
  });
});
