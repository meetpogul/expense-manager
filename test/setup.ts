import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Stub Next.js / Node server-only guard so Vitest (jsdom) doesn't reject it.
vi.mock("server-only", () => ({}));

// Mock per-feature server actions so component tests never touch Supabase.
vi.mock("@/features/transactions/server/actions", () => ({
  createTransactionAction: vi.fn(),
  deleteTransactionAction: vi.fn(),
  updateTransactionAction: vi.fn(),
}));

vi.mock("@/features/accounts/server/actions", () => ({
  createAccountAction: vi.fn(),
  softDeleteAccountAction: vi.fn(),
  updateAccountAction: vi.fn(),
}));

vi.mock("@/features/categories/server/actions", () => ({
  createCategoryAction: vi.fn(),
  softDeleteCategoryAction: vi.fn(),
  updateCategoryAction: vi.fn(),
}));

vi.mock("@/features/budgets/server/actions", () => ({
  createBudgetAction: vi.fn(),
  setBudgetActiveAction: vi.fn(),
  softDeleteBudgetAction: vi.fn(),
  updateBudgetAction: vi.fn(),
}));

vi.mock("@/features/recurring/server/actions", () => ({
  createRecurringRuleAction: vi.fn(),
  deactivateRecurringRuleAction: vi.fn(),
  executeRecurringRuleAction: vi.fn(),
  updateRecurringRuleAction: vi.fn(),
}));

vi.mock("@/features/auth/server/actions", () => ({
  signInOrSignUpAction: vi.fn(),
  signOutAction: vi.fn(),
}));
