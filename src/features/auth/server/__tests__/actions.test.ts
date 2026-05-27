import { describe, expect, it, vi, beforeEach } from "vitest";
import { signInOrSignUpAction, signOutAction } from "../actions";

vi.unmock("@/features/auth/server/actions");

const { mockSignIn, mockSignUp, mockSignOut } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock("@/platform/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  }),
}));

const redirectError = new Error("NEXT_REDIRECT");

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw redirectError;
  }),
}));

const initialState = { ok: false, message: "" };

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signInOrSignUpAction", () => {
    it("returns error when email is missing", async () => {
      const result = await signInOrSignUpAction(
        initialState,
        form({ password: "pass" }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Enter your email and password.");
    });

    it("returns error when password is missing", async () => {
      const result = await signInOrSignUpAction(
        initialState,
        form({ email: "test@test.com" }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Enter your email and password.");
    });

    it("signs in successfully and redirects", async () => {
      mockSignIn.mockResolvedValueOnce({ error: null });

      await expect(
        signInOrSignUpAction(
          initialState,
          form({ email: "test@test.com", password: "pass" }),
        ),
      ).rejects.toThrow("NEXT_REDIRECT");

      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "pass",
      });
    });

    it("returns error on failed sign-in", async () => {
      mockSignIn.mockResolvedValueOnce({
        error: new Error("Invalid credentials"),
      });

      const result = await signInOrSignUpAction(
        initialState,
        form({ email: "test@test.com", password: "wrong" }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Invalid credentials");
    });

    it("signs up with session and redirects", async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { session: { user: { id: "new-user" } } },
        error: null,
      });

      await expect(
        signInOrSignUpAction(
          initialState,
          form({
            email: "new@test.com",
            password: "pass",
            full_name: "New User",
            intent: "signup",
          }),
        ),
      ).rejects.toThrow("NEXT_REDIRECT");

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@test.com",
        password: "pass",
        options: { data: { full_name: "New User" } },
      });
    });

    it("signs up without session returns confirmation message", async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await signInOrSignUpAction(
        initialState,
        form({
          email: "new@test.com",
          password: "pass",
          intent: "signup",
        }),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe(
        "Account created. Check your email to confirm your sign in.",
      );
    });

    it("returns error on failed sign-up", async () => {
      mockSignUp.mockResolvedValueOnce({
        error: new Error("Email already registered"),
      });

      const result = await signInOrSignUpAction(
        initialState,
        form({
          email: "exists@test.com",
          password: "pass",
          intent: "signup",
        }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Email already registered");
    });
  });

  describe("signOutAction", () => {
    it("signs out and redirects to login", async () => {
      mockSignOut.mockResolvedValueOnce({ error: null });

      await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
