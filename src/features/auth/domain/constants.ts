import type { AuthMode } from "./types";

export const AUTH_MODES = ["signin", "signup"] as const satisfies AuthMode[];

export const AUTH_MODE_LABELS: Record<AuthMode, string> = {
  signin: "Sign in",
  signup: "Sign up",
};

export const AUTH_TOGGLE_LABELS: Record<AuthMode, string> = {
  signin: "Don't have an account? Sign up",
  signup: "Already have an account? Sign in",
};
