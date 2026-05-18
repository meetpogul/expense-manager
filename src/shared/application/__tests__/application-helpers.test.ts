import { describe, expect, it } from "vitest";

import { actionError, actionSuccess, emptyActionState } from "../action-state";
import { optionalStringFromFormData, stringFromFormData } from "../form-data";
import { err, ok } from "@/shared/domain/result";

describe("shared application helpers", () => {
  it("builds action states consistently", () => {
    expect(emptyActionState).toEqual({ ok: false, message: "" });
    expect(actionError("Nope")).toEqual({ ok: false, message: "Nope" });
    expect(actionSuccess("Saved")).toEqual({ ok: true, message: "Saved" });
  });

  it("reads required and optional strings from form data", () => {
    const formData = new FormData();
    formData.set("name", " Cash ");
    formData.set("empty", " ");

    expect(stringFromFormData(formData, "name")).toBe(" Cash ");
    expect(stringFromFormData(formData, "missing")).toBe("");
    expect(optionalStringFromFormData(formData, "name")).toBe("Cash");
    expect(optionalStringFromFormData(formData, "empty")).toBeNull();
  });

  it("builds result values", () => {
    expect(ok(123)).toEqual({ ok: true, value: 123 });
    expect(err("bad")).toEqual({ ok: false, error: "bad" });
  });
});
