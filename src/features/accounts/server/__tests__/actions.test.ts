import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createAccountAction,
  updateAccountAction,
  softDeleteAccountAction,
} from "../actions";

vi.unmock("@/features/accounts/server/actions");

vi.mock("@/features/auth/server/session", () => ({
  getSupabaseAndUser: vi.fn().mockResolvedValue({
    supabase: {},
    userId: "user-1",
  }),
  getUser: vi.fn().mockResolvedValue({ id: "user-1" }),
  createServiceClient: vi.fn().mockReturnValue({}),
}));

vi.mock("@/shared/application/revalidation", () => ({
  revalidateFinancePaths: vi.fn(),
}));

const { mockCreate, mockUpdate, mockSoftDelete } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockSoftDelete: vi.fn(),
}));

vi.mock(
  "@/features/accounts/infrastructure/supabase-account.repository",
  () => ({
    SupabaseAccountRepository: class {
      create = mockCreate;
      update = mockUpdate;
      softDelete = mockSoftDelete;
    },
  }),
);

const initialState = { ok: false, message: "" };

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

const validFields = {
  name: "Test Account",
  type: "bank",
  balance: "5000",
};

describe("accounts server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAccountAction", () => {
    it("returns field errors on validation failure", async () => {
      const result = await createAccountAction(initialState, form({}));
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("calls repository and returns ok on success", async () => {
      mockCreate.mockResolvedValueOnce(undefined);
      const result = await createAccountAction(initialState, form(validFields));
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Account saved.");
      expect(mockCreate).toHaveBeenCalled();
    });

    it("catches database error and returns error message", async () => {
      mockCreate.mockRejectedValueOnce(new Error("DB Error"));
      const result = await createAccountAction(initialState, form(validFields));
      expect(result.ok).toBe(false);
      expect(result.message).toBe("DB Error");
    });
  });

  describe("updateAccountAction", () => {
    it("returns error when id is missing", async () => {
      const result = await updateAccountAction(initialState, form(validFields));
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Missing account.");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns field errors on validation failure", async () => {
      const result = await updateAccountAction(
        initialState,
        form({ id: "acct-1" }),
      );
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("calls repository and returns ok on success", async () => {
      mockUpdate.mockResolvedValueOnce(undefined);
      const result = await updateAccountAction(
        initialState,
        form({ id: "acct-1", ...validFields }),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Account updated.");
      expect(mockUpdate).toHaveBeenCalledWith("acct-1", expect.any(Object));
    });

    it("catches database error", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Update failed"));
      const result = await updateAccountAction(
        initialState,
        form({ id: "acct-1", ...validFields }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Update failed");
    });
  });

  describe("softDeleteAccountAction", () => {
    it("returns early when id is missing", async () => {
      await softDeleteAccountAction(form({}));
      expect(mockSoftDelete).not.toHaveBeenCalled();
    });

    it("returns early when no user", async () => {
      const { getUser } = await import("@/features/auth/server/session");
      vi.mocked(getUser).mockResolvedValueOnce(null);
      await softDeleteAccountAction(form({ id: "acct-1" }));
      expect(mockSoftDelete).not.toHaveBeenCalled();
    });

    it("calls repository and revalidates on success", async () => {
      mockSoftDelete.mockResolvedValueOnce(undefined);
      await softDeleteAccountAction(form({ id: "acct-1" }));
      expect(mockSoftDelete).toHaveBeenCalledWith("acct-1", expect.any(String));
    });
  });
});
