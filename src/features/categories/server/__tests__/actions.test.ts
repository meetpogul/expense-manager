import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createCategoryAction,
  updateCategoryAction,
  softDeleteCategoryAction,
} from "../actions";

vi.unmock("@/features/categories/server/actions");

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
  "@/features/categories/infrastructure/supabase-category.repository",
  () => ({
    SupabaseCategoryRepository: class {
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
  name: "Test Category",
  type: "expense",
};

describe("categories server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCategoryAction", () => {
    it("returns field errors on validation failure", async () => {
      const result = await createCategoryAction(initialState, form({}));
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("calls repository and returns ok on success", async () => {
      mockCreate.mockResolvedValueOnce(undefined);
      const result = await createCategoryAction(
        initialState,
        form(validFields),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Category saved.");
      expect(mockCreate).toHaveBeenCalled();
    });

    it("catches database error and returns error message", async () => {
      mockCreate.mockRejectedValueOnce(new Error("DB Error"));
      const result = await createCategoryAction(
        initialState,
        form(validFields),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("DB Error");
    });
  });

  describe("updateCategoryAction", () => {
    it("returns error when id is missing", async () => {
      const result = await updateCategoryAction(
        initialState,
        form(validFields),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Missing category.");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns field errors on validation failure", async () => {
      const result = await updateCategoryAction(
        initialState,
        form({ id: "cat-1" }),
      );
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("calls repository and returns ok on success", async () => {
      mockUpdate.mockResolvedValueOnce(undefined);
      const result = await updateCategoryAction(
        initialState,
        form({ id: "cat-1", ...validFields }),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Category updated.");
      expect(mockUpdate).toHaveBeenCalledWith("cat-1", expect.any(Object));
    });

    it("catches database error", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Update failed"));
      const result = await updateCategoryAction(
        initialState,
        form({ id: "cat-1", ...validFields }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Update failed");
    });
  });

  describe("softDeleteCategoryAction", () => {
    it("returns early when id is missing", async () => {
      await softDeleteCategoryAction(form({}));
      expect(mockSoftDelete).not.toHaveBeenCalled();
    });

    it("returns early when no user", async () => {
      const { getUser } = await import("@/features/auth/server/session");
      vi.mocked(getUser).mockResolvedValueOnce(null);
      await softDeleteCategoryAction(form({ id: "cat-1" }));
      expect(mockSoftDelete).not.toHaveBeenCalled();
    });

    it("calls repository and revalidates on success", async () => {
      mockSoftDelete.mockResolvedValueOnce(undefined);
      await softDeleteCategoryAction(form({ id: "cat-1" }));
      expect(mockSoftDelete).toHaveBeenCalledWith("cat-1", expect.any(String));
    });
  });
});
