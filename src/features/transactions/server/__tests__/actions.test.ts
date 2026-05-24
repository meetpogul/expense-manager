import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "../actions";

vi.unmock("@/features/transactions/server/actions");

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

const { mockCreate, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock(
  "@/features/transactions/application/use-cases/create-transaction.use-case",
  () => ({
    CreateTransactionUseCase: class {
      execute = mockCreate;
    },
  }),
);

vi.mock(
  "@/features/transactions/application/use-cases/update-transaction.use-case",
  () => ({
    UpdateTransactionUseCase: class {
      execute = mockUpdate;
    },
  }),
);

vi.mock(
  "@/features/transactions/application/use-cases/delete-transaction.use-case",
  () => ({
    DeleteTransactionUseCase: class {
      execute = mockDelete;
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
  type: "expense",
  amount: "1500",
  account_id: "acct-1",
  category_id: "cat-1",
  date: "2026-05-10",
};

describe("transactions server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTransactionAction", () => {
    it("returns field errors on validation failure", async () => {
      const result = await createTransactionAction(initialState, form({}));
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("calls use case and returns ok on success", async () => {
      mockCreate.mockResolvedValueOnce({ id: "tx-1" });
      const result = await createTransactionAction(
        initialState,
        form(validFields),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Transaction saved.");
      expect(mockCreate).toHaveBeenCalled();
    });

    it("catches database error and returns error message", async () => {
      mockCreate.mockRejectedValueOnce(new Error("DB Error"));
      const result = await createTransactionAction(
        initialState,
        form(validFields),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("DB Error");
    });
  });

  describe("updateTransactionAction", () => {
    it("returns error when id is missing", async () => {
      const result = await updateTransactionAction(
        initialState,
        form(validFields),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Missing transaction.");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns field errors on validation failure", async () => {
      const result = await updateTransactionAction(
        initialState,
        form({ id: "tx-1" }),
      );
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("calls use case and returns ok on success", async () => {
      mockUpdate.mockResolvedValueOnce(undefined);
      const result = await updateTransactionAction(
        initialState,
        form({ id: "tx-1", ...validFields }),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Transaction updated.");
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("catches database error", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Update failed"));
      const result = await updateTransactionAction(
        initialState,
        form({ id: "tx-1", ...validFields }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Update failed");
    });
  });

  describe("deleteTransactionAction", () => {
    it("returns early when id is missing", async () => {
      await deleteTransactionAction(form({}));
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("returns early when no user", async () => {
      const { getUser } = await import("@/features/auth/server/session");
      vi.mocked(getUser).mockResolvedValueOnce(null);
      await deleteTransactionAction(form({ id: "tx-1" }));
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("calls use case and revalidates on success", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      await deleteTransactionAction(form({ id: "tx-1" }));
      expect(mockDelete).toHaveBeenCalledWith("tx-1", expect.any(String));
    });
  });
});
