import { describe, expect, it } from "vitest";

import { err, ok, validErr, validOk } from "../result";

import type { Result, ValidationResult } from "../result";

describe("shared Result type helpers", () => {
  it("ok() returns { ok: true, value }", () => {
    const result: Result<number> = ok(42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("err() returns { ok: false, error }", () => {
    const result: Result<never, string> = err("something went wrong");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("something went wrong");
    }
  });

  it("ok() works with complex value types", () => {
    const result = ok({ id: "user-1", name: "Alice" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ id: "user-1", name: "Alice" });
    }
  });

  it("err() works with complex error types", () => {
    const error = new Error("Domain failure");
    const result = err(error);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Domain failure");
    }
  });

  it("type narrowing: ok true branch accesses value, false branch accesses error", () => {
    function processResult(r: Result<string, number>): string {
      if (r.ok) {
        return r.value.toUpperCase();
      }
      return `error: ${r.error}`;
    }

    expect(processResult(ok("hello"))).toBe("HELLO");
    expect(processResult(err(404))).toBe("error: 404");
  });

  it("validOk() returns { ok: true, data }", () => {
    const result: ValidationResult<string> = validOk("parsed data");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe("parsed data");
    }
  });

  it("validErr() returns { ok: false, state } with provided ActionState", () => {
    const state = {
      ok: false as const,
      message: "Check the highlighted fields.",
      fieldErrors: { name: "Required." },
    };
    const result: ValidationResult<string> = validErr(state);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state).toEqual(state);
      expect(result.state.fieldErrors).toEqual({ name: "Required." });
    }
  });

  it("ValidationResult ok branch has data, error branch has state", () => {
    const success: ValidationResult<number> = validOk(100);
    const failure: ValidationResult<number> = validErr({
      ok: false,
      message: "Invalid",
      fieldErrors: {},
    });

    expect(success.ok).toBe(true);
    expect(failure.ok).toBe(false);

    if (success.ok) expect(success.data).toBe(100);
    if (!failure.ok) expect(failure.state.message).toBe("Invalid");
  });
});
