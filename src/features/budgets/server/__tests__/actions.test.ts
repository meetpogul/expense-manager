import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createBudgetAction,
  updateBudgetAction,
  softDeleteBudgetAction,
  setBudgetActiveAction,
} from "../actions";

vi.unmock("@/features/budgets/server/actions");

vi.mock("@/features/auth/server/session", () => ({
  getSupabaseAndUser: vi.fn().mockResolvedValue({
    supabase: {},
    userId: "user-1",
  }),
}));

vi.mock("@/shared/application/revalidation", () => ({
  revalidateFinancePaths: vi.fn(),
}));

const { mockCreate, mockUpdate, mockSoftDelete, mockSetActive } = vi.hoisted(
  () => ({
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockSoftDelete: vi.fn(),
    mockSetActive: vi.fn(),
  }),
);

vi.mock("@/features/budgets/infrastructure/supabase-budget.repository", () => ({
  SupabaseBudgetRepository: class {
    create = mockCreate;
    update = mockUpdate;
    softDelete = mockSoftDelete;
    setActive = mockSetActive;
  },
}));

const initialState = { ok: false, message: "" };

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

const validFields = {
  amount: "10000",
  period: "monthly",
  start_date: "2026-06-01",
};

describe("budgets server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBudgetAction", () => {
    it("returns field errors on validation failure", async () => {
      const result = await createBudgetAction(initialState, form({}));
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("calls repository and returns ok on success", async () => {
      mockCreate.mockResolvedValueOnce(undefined);
      const result = await createBudgetAction(initialState, form(validFields));
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Budget saved.");
      expect(mockCreate).toHaveBeenCalled();
    });

    it("catches database error and returns error message", async () => {
      mockCreate.mockRejectedValueOnce(new Error("DB Error"));
      const result = await createBudgetAction(initialState, form(validFields));
      expect(result.ok).toBe(false);
      expect(result.message).toBe("DB Error");
    });
  });

  describe("updateBudgetAction", () => {
    it("returns error when id is missing", async () => {
      const result = await updateBudgetAction(initialState, form(validFields));
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Missing budget.");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns field errors on validation failure", async () => {
      const result = await updateBudgetAction(
        initialState,
        form({ id: "budget-1" }),
      );
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("calls repository and returns ok on success", async () => {
      mockUpdate.mockResolvedValueOnce(undefined);
      const result = await updateBudgetAction(
        initialState,
        form({ id: "budget-1", ...validFields }),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Budget updated.");
      expect(mockUpdate).toHaveBeenCalledWith("budget-1", expect.any(Object));
    });

    it("catches database error", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Update failed"));
      const result = await updateBudgetAction(
        initialState,
        form({ id: "budget-1", ...validFields }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Update failed");
    });
  });

  describe("softDeleteBudgetAction", () => {
    it("returns early when id is missing", async () => {
      await softDeleteBudgetAction(form({}));
      expect(mockSoftDelete).not.toHaveBeenCalled();
    });

    it("calls repository and revalidates on success", async () => {
      mockSoftDelete.mockResolvedValueOnce(undefined);
      await softDeleteBudgetAction(form({ id: "budget-1" }));
      expect(mockSoftDelete).toHaveBeenCalledWith(
        "budget-1",
        expect.any(String),
      );
    });
  });

  describe("setBudgetActiveAction", () => {
    it("returns early when id is missing", async () => {
      await setBudgetActiveAction(form({ isActive: "true" }));
      expect(mockSetActive).not.toHaveBeenCalled();
    });

    it("sets budget active", async () => {
      mockSetActive.mockResolvedValueOnce(undefined);
      await setBudgetActiveAction(form({ id: "budget-1", isActive: "true" }));
      expect(mockSetActive).toHaveBeenCalledWith("budget-1", true);
    });

    it("sets budget inactive", async () => {
      mockSetActive.mockResolvedValueOnce(undefined);
      await setBudgetActiveAction(form({ id: "budget-1", isActive: "false" }));
      expect(mockSetActive).toHaveBeenCalledWith("budget-1", false);
    });
  });
});
