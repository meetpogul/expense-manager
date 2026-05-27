import type { ActionState } from "@/lib/actions/state";

export type Result<TValue, TError = Error> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export function ok<TValue>(value: TValue): Result<TValue, never> {
  return { ok: true, value };
}

export function err<TError>(error: TError): Result<never, TError> {
  return { ok: false, error };
}

/**
 * Discriminated union for form validation returns.
 * Keeps the `data` / `state` property names that all server actions and tests
 * already rely on, while moving the type definition to a single shared location.
 */
export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; state: ActionState };

export function validOk<T>(data: T): ValidationResult<T> {
  return { ok: true, data };
}

export function validErr<T>(state: ActionState): ValidationResult<T> {
  return { ok: false, state };
}
