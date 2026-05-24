import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createRecurringRuleAction,
  deactivateRecurringRuleAction,
  updateRecurringRuleAction,
  executeRecurringRuleAction,
} from "../actions";

vi.unmock("@/features/recurring/server/actions");

// Mock Supabase and User
vi.mock("@/features/auth/server/session", () => ({
  getSupabaseAndUser: vi.fn().mockResolvedValue({
    supabase: {},
    userId: "user-1",
  }),
}));

// Mock Revalidation
vi.mock("@/shared/application/revalidation", () => ({
  revalidateFinancePaths: vi.fn(),
}));

const { mockCreate, mockDeactivate, mockUpdate, mockExecute } = vi.hoisted(
  () => ({
    mockCreate: vi.fn(),
    mockDeactivate: vi.fn(),
    mockUpdate: vi.fn(),
    mockExecute: vi.fn(),
  }),
);

vi.mock(
  "@/features/recurring/infrastructure/supabase-recurring-rule.repository",
  () => ({
    SupabaseRecurringRuleRepository: class {
      create = mockCreate;
      deactivate = mockDeactivate;
      update = mockUpdate;
    },
  }),
);

vi.mock(
  "@/features/recurring/application/use-cases/execute-recurring-rule.use-case",
  () => ({
    ExecuteRecurringRuleUseCase: class {
      execute = mockExecute;
    },
  }),
);

const initialState = { ok: false, message: "" };

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

const validExpenseFields = {
  type: "expense",
  amount: "2500",
  account_id: "bank",
  category_id: "rent",
  frequency: "monthly",
  start_date: "2026-05-01",
  next_due_date: "2026-06-01",
};

describe("recurring server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create action with validation failure returns state with field errors", async () => {
    // Missing required fields
    const formData = form({ type: "expense" });
    const result = await createRecurringRuleAction(initialState, formData);

    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("create action with success executes use case and returns ok", async () => {
    mockCreate.mockResolvedValueOnce(undefined);

    const formData = form(validExpenseFields);
    const result = await createRecurringRuleAction(initialState, formData);

    expect(result.ok).toBe(true);
    expect(result.message).toBe("Recurring rule saved.");
    expect(mockCreate).toHaveBeenCalled();
  });

  it("create action with database error catches and returns error message", async () => {
    mockCreate.mockRejectedValueOnce(new Error("DB Connection Error"));

    const formData = form(validExpenseFields);
    const result = await createRecurringRuleAction(initialState, formData);

    expect(result.ok).toBe(false);
    expect(result.message).toBe("DB Connection Error");
  });

  it("deactivate action runs use case and revalidates on success", async () => {
    mockDeactivate.mockResolvedValueOnce(undefined);
    const formData = form({ id: "rule-1" });

    await deactivateRecurringRuleAction(formData);

    expect(mockDeactivate).toHaveBeenCalledWith("rule-1");
  });

  it("deactivate action returns early if id is missing", async () => {
    const formData = form({}); // missing id

    await deactivateRecurringRuleAction(formData);

    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  describe("updateRecurringRuleAction", () => {
    it("returns error when id is missing", async () => {
      const result = await updateRecurringRuleAction(
        initialState,
        form(validExpenseFields),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Missing recurring rule.");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns field errors on validation failure", async () => {
      const result = await updateRecurringRuleAction(
        initialState,
        form({ id: "rule-1" }),
      );
      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toBeDefined();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("calls repository and returns ok on success", async () => {
      mockUpdate.mockResolvedValueOnce(undefined);
      const result = await updateRecurringRuleAction(
        initialState,
        form({ id: "rule-1", ...validExpenseFields }),
      );
      expect(result.ok).toBe(true);
      expect(result.message).toBe("Recurring rule updated.");
      expect(mockUpdate).toHaveBeenCalledWith("rule-1", expect.any(Object));
    });

    it("catches database error", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Update failed"));
      const result = await updateRecurringRuleAction(
        initialState,
        form({ id: "rule-1", ...validExpenseFields }),
      );
      expect(result.ok).toBe(false);
      expect(result.message).toBe("Update failed");
    });
  });

  describe("executeRecurringRuleAction", () => {
    it("returns early when id is missing", async () => {
      await executeRecurringRuleAction(form({}));
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it("calls use case and revalidates on success", async () => {
      mockExecute.mockResolvedValueOnce(undefined);
      await executeRecurringRuleAction(form({ id: "rule-1" }));
      expect(mockExecute).toHaveBeenCalledWith("rule-1");
    });
  });
});
