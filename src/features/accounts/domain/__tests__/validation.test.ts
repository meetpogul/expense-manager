import { describe, expect, it } from "vitest";

import { validateAccountForm } from "../validation";

describe("Account Validation", () => {
  it("parses valid account form data", () => {
    const formData = new FormData();
    formData.set("name", "Savings");
    formData.set("type", "bank");
    formData.set("balance", "10,000");

    const result = validateAccountForm(formData);

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Savings",
        type: "bank",
        balance: 10000,
      },
    });
  });

  it("handles empty or missing balance by defaulting to 0", () => {
    const formData = new FormData();
    formData.set("name", "Cash");
    formData.set("type", "cash");

    const result = validateAccountForm(formData);

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Cash",
        type: "cash",
        balance: 0,
      },
    });
  });

  it("returns field errors for invalid input", () => {
    const formData = new FormData();
    // Missing name, invalid type, invalid balance format
    formData.set("name", "   "); // Should fail trim
    formData.set("type", "invalid_type");
    formData.set("balance", "not_a_number");

    const result = validateAccountForm(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toEqual({
        name: "Account name is required.",
        type: "Choose a valid account type.",
        balance: "Invalid input: expected number, received NaN",
      });
    }
  });

  it("handles non-string form data values gracefully", () => {
    const formData = new FormData();
    // File object simulates a non-string value which should map to ""
    formData.set("name", new File([""], "test.txt"));
    formData.set("type", "bank");

    const result = validateAccountForm(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toEqual({
        name: "Account name is required.",
      });
    }
  });
});
