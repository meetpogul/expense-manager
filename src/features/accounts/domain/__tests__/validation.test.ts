import { describe, expect, it } from "vitest";

import { validateAccountForm } from "../validation";
import { accountFormSchema } from "../account.schema";

import { form } from "@/test/form-helper";

const validFields = { name: "Savings", type: "bank", balance: "10000" };

describe("Account Validation", () => {
  it("parses valid account form data", () => {
    const formData = new FormData();
    formData.set("name", "Savings");
    formData.set("type", "bank");
    formData.set("balance", "10,000");

    const result = validateAccountForm(formData);

    expect(result).toEqual({
      ok: true,
      data: { name: "Savings", type: "bank", balance: 10000 },
    });
  });

  it("handles empty or missing balance by defaulting to 0", () => {
    const formData = new FormData();
    formData.set("name", "Cash");
    formData.set("type", "cash");

    const result = validateAccountForm(formData);

    expect(result).toEqual({
      ok: true,
      data: { name: "Cash", type: "cash", balance: 0 },
    });
  });

  it("returns field errors for invalid input", () => {
    const formData = new FormData();
    formData.set("name", "   ");
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

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("rejects empty FormData", () => {
    const result = validateAccountForm(form());
    expect(result.ok).toBe(false);
  });

  it("rejects name with only whitespace", () => {
    const result = validateAccountForm(form({ ...validFields, name: "   " }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        name: expect.any(String),
      });
    }
  });

  it("accepts comma-formatted balance ('5,000' → 5000)", () => {
    const result = validateAccountForm(
      form({ ...validFields, balance: "5,000" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.balance).toBe(5000);
    }
  });

  it("accepts negative balance (no restriction at schema level)", () => {
    const result = validateAccountForm(
      form({ ...validFields, balance: "-500" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.balance).toBe(-500);
    }
  });

  it("rejects non-numeric balance string", () => {
    const result = validateAccountForm(
      form({ ...validFields, balance: "abc" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        balance: expect.any(String),
      });
    }
  });

  it("rejects all valid account types except the invalid one", () => {
    const validTypes = [
      "cash",
      "bank",
      "credit_card",
      "upi",
      "wallet",
      "other",
    ];
    for (const type of validTypes) {
      const result = validateAccountForm(form({ ...validFields, type }));
      expect(result.ok).toBe(true);
    }

    const invalid = validateAccountForm(
      form({ ...validFields, type: "unsupported_type" }),
    );
    expect(invalid.ok).toBe(false);
  });

  it("trims the account name", () => {
    const result = validateAccountForm(
      form({ ...validFields, name: "  My Savings  " }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("My Savings");
    }
  });

  // ── Schema preprocessor direct tests ──────────────────────────────────────

  it("schema amountFromForm passes through non-string values", () => {
    // Pass a raw number instead of string from FormData
    const result = accountFormSchema.safeParse({
      name: "Savings",
      type: "bank",
      balance: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balance).toBe(5000);
    }
  });

  it("schema amountFromForm returns NaN for unparseable comma-stripped string", () => {
    // "1,2,3" stripped of commas becomes "123", but "abc" becomes "abc" which is NaN
    const result = accountFormSchema.safeParse({
      name: "Savings",
      type: "bank",
      balance: "abc,def",
    });
    expect(result.success).toBe(false);
  });
});
