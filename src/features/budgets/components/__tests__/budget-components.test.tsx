import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  actionStateMock,
  resetActionState,
} from "@/test/mock-use-action-state";
import type { BudgetDetail, BudgetWithUsage } from "../../domain/types";
import type { Category } from "@/features/categories/domain/types";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useActionState: vi.fn(() => [
      actionStateMock.state,
      actionStateMock.formAction,
      actionStateMock.pending,
    ]),
  };
});

import { BudgetDetail as BudgetDetailView } from "../budget-detail";
import { BudgetFormContainer } from "../budget-form";
import { BudgetList } from "../budget-list";

const categories: Category[] = [
  {
    id: "food",
    user_id: null,
    name: "Food & Dining",
    icon: "FD",
    color: null,
    type: "expense",
    is_default: true,
    created_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: "salary",
    user_id: null,
    name: "Salary",
    icon: "SA",
    color: null,
    type: "income",
    is_default: true,
    created_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
  },
];

const budget: BudgetWithUsage = {
  id: "budget-food",
  user_id: "user-1",
  category_id: "food",
  amount: 1000,
  period: "monthly",
  start_date: "2026-05-01",
  end_date: null,
  is_active: true,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
  deleted_at: null,
  categories: {
    id: "food",
    name: "Food & Dining",
    icon: "FD",
    color: null,
    type: "expense",
  },
  usage: {
    spent: 850,
    remaining: 150,
    percentUsed: 85,
    status: "warning",
    window: { from: "2026-05-01", to: "2026-05-31" },
  },
};

describe("budget components", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders an empty budget list state", () => {
    render(<BudgetList budgets={[]} />);

    expect(screen.getByText("No budgets yet")).toBeVisible();
  });

  it("renders budget progress, status, and row actions", () => {
    render(<BudgetList budgets={[budget]} />);

    expect(screen.getByText("Food & Dining")).toBeVisible();
    expect(screen.getByText("Near limit")).toBeVisible();
    expect(screen.getByText(/85% used/)).toBeVisible();
    expect(screen.getByText(/left/)).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "85",
    );
    expect(screen.getByLabelText("View budget")).toBeVisible();
    expect(screen.getByLabelText("Edit budget")).toBeVisible();
    expect(screen.getByLabelText("Pause budget")).toBeVisible();
    expect(screen.queryByLabelText("Delete budget")).not.toBeInTheDocument();
  });

  it("renders resume controls for paused budgets", () => {
    render(<BudgetList budgets={[{ ...budget, is_active: false }]} />);

    expect(screen.getByText("Paused")).toBeVisible();
    expect(screen.getByLabelText("Resume budget")).toBeVisible();
  });

  it("renders budget detail with related transactions", () => {
    const detail: BudgetDetail = {
      ...budget,
      transactions: [
        {
          id: "transaction-1",
          user_id: "user-1",
          account_id: "cash",
          category_id: "food",
          type: "expense",
          amount: 450,
          note: "Dinner",
          merchant_name: "Swiggy",
          date: "2026-05-10",
          time: null,
          payment_method: null,
          created_at: "2026-05-10T00:00:00.000Z",
          updated_at: "2026-05-10T00:00:00.000Z",
          deleted_at: null,
          accounts: { id: "cash", name: "Cash", type: "cash" },
          categories: {
            id: "food",
            name: "Food & Dining",
            icon: "FD",
            color: null,
            type: "expense",
          },
        },
      ],
    };

    render(<BudgetDetailView budget={detail} />);

    expect(screen.getByText("Used")).toBeVisible();
    expect(screen.getByText("Remaining")).toBeVisible();
    expect(screen.getByText("85% used")).toBeVisible();
    expect(screen.getByText("Swiggy")).toBeVisible();
    expect(screen.getByRole("button", { name: /pause/i })).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "85",
    );
  });

  it("renders create defaults and only expense categories", () => {
    render(<BudgetFormContainer categories={categories} />);

    expect(screen.getByLabelText("Limit")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("");
    expect(screen.getByText("Overall spending")).toBeVisible();
    expect(screen.getByRole("option", { name: /Food & Dining/ })).toBeVisible();
    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save budget/i })).toBeEnabled();
  });

  it("renders edit values and validation state", () => {
    resetActionState({
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: {
        amount: "Enter an amount greater than 0.",
      },
    });
    actionStateMock.pending = true;

    render(<BudgetFormContainer budget={budget} categories={categories} />);

    expect(screen.getByLabelText("Limit")).toHaveValue("1000");
    expect(screen.getByLabelText("Category")).toHaveValue("food");
    expect(screen.getByText("Check the highlighted fields.")).toBeVisible();
    expect(screen.getByText("Enter an amount greater than 0.")).toBeVisible();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("renders edit form button text when not pending", () => {
    render(<BudgetFormContainer budget={budget} categories={categories} />);
    expect(
      screen.getByRole("button", { name: /update budget/i }),
    ).toBeEnabled();
  });
  it("renders budget with null categories (fallback label)", () => {
    const nullCategoryBudget: BudgetWithUsage = {
      ...budget,
      categories: null,
    };
    render(<BudgetList budgets={[nullCategoryBudget]} />);
    expect(screen.getByText("Overall spending")).toBeVisible();
  });

  it("renders budget detail with over-budget status", () => {
    const overBudget: BudgetDetail = {
      ...budget,
      transactions: [],
      usage: {
        ...budget.usage,
        spent: 1200,
        remaining: -200,
        percentUsed: 120,
        status: "alert",
      },
    };
    render(<BudgetDetailView budget={overBudget} />);
    expect(screen.getByText("Over")).toBeVisible();
    expect(screen.getByText("120% used")).toBeVisible();

    render(<BudgetList budgets={[overBudget]} />);
    expect(screen.getByText(/200(\.00)? over/)).toBeVisible();
  });

  it("renders budget detail with zero transactions empty state", () => {
    const emptyDetail: BudgetDetail = {
      ...budget,
      transactions: [],
    };
    render(<BudgetDetailView budget={emptyDetail} />);
    expect(screen.getByText("No related spending")).toBeVisible();
    expect(
      screen.getByText(
        "Matching expenses for this budget period will appear here.",
      ),
    ).toBeVisible();
  });

  it("renders budget detail for paused budget", () => {
    const pausedDetail: BudgetDetail = {
      ...budget,
      is_active: false,
      transactions: [],
    };
    render(<BudgetDetailView budget={pausedDetail} />);
    expect(screen.getByText("Paused")).toBeVisible();
    expect(screen.getByRole("button", { name: /resume/i })).toBeVisible();
  });

  it("renders budget detail transaction with null fallbacks", () => {
    const detailWithNullTx: BudgetDetail = {
      ...budget,
      categories: null, // Test line 50
      transactions: [
        {
          id: "tx-2",
          user_id: "user-1",
          account_id: "acc",
          category_id: "cat",
          type: "expense",
          amount: 50,
          note: null,
          merchant_name: null,
          date: "2026-05-15",
          time: null,
          payment_method: null,
          created_at: "2026-05-15T00:00:00.000Z",
          updated_at: "2026-05-15T00:00:00.000Z",
          deleted_at: null,
          accounts: null,
          categories: null, // Test line 129 fallback "Transaction"
        },
      ],
    };
    render(<BudgetDetailView budget={detailWithNullTx} />);
    expect(screen.getByText("Transaction")).toBeVisible(); // merchant/note/category fallback
    expect(screen.getByText("Overall spending")).toBeVisible(); // header fallback
  });

  it("renders category option without icon in budget form", () => {
    const noIconCategories = [{ ...categories[0]!, icon: null }];
    render(<BudgetFormContainer categories={noIconCategories} />);
    expect(screen.getByRole("option", { name: "Food & Dining" })).toBeVisible(); // no trailing space from icon
  });
});
