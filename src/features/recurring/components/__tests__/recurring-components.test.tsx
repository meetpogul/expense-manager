import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/features/accounts/domain/types";
import type { Category } from "@/features/categories/domain/types";
import type { ActionState } from "@/lib/actions/state";
import type { RecurringRule } from "../../domain/types";

const actionStateMock = vi.hoisted(() => ({
  formAction: vi.fn(),
  pending: false,
  state: {
    ok: false,
    message: "",
  } as ActionState,
}));

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

import { RecurringRuleForm } from "../recurring-rule-form";
import { RecurringRuleList } from "../recurring-rule-list";

const accounts: Account[] = [
  {
    id: "bank",
    user_id: "user-1",
    name: "Bank",
    type: "bank",
    balance: 10000,
    color: null,
    icon: null,
    is_default: true,
    is_active: true,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
  },
];

const categories: Category[] = [
  {
    id: "rent",
    user_id: null,
    name: "Housing & Rent",
    icon: "HR",
    color: null,
    type: "expense",
    is_default: true,
    created_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
  },
];

const rule: RecurringRule = {
  id: "rule-rent",
  user_id: "user-1",
  account_id: "bank",
  category_id: "rent",
  type: "expense",
  amount: 25000,
  note: "Rent",
  frequency: "monthly",
  start_date: "2026-05-01",
  end_date: null,
  next_due_date: "2026-06-01",
  is_active: true,
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
  accounts: { id: "bank", name: "Bank", type: "bank" },
  categories: {
    id: "rent",
    name: "Housing & Rent",
    icon: "HR",
    color: null,
    type: "expense",
  },
};

function resetActionState(state?: Partial<ActionState>) {
  actionStateMock.formAction = vi.fn();
  actionStateMock.pending = false;
  actionStateMock.state = {
    ok: false,
    message: "",
    ...state,
  };
}

describe("recurring components", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders an empty recurring list state", () => {
    render(<RecurringRuleList rules={[]} />);

    expect(screen.getByText("No recurring rules yet")).toBeVisible();
  });

  it("renders frequency, next date, and active controls", () => {
    render(<RecurringRuleList rules={[rule]} todayKey="2026-05-18" />);

    expect(screen.getByText("Rent")).toBeVisible();
    expect(screen.getByText("Monthly")).toBeVisible();
    expect(screen.getByText("Active")).toBeVisible();
    expect(screen.getByText(/Next/)).toBeVisible();
    expect(screen.getByLabelText("Edit recurring rule")).toBeVisible();
    expect(screen.getByLabelText("Pause recurring rule")).toBeVisible();
    expect(
      screen.queryByLabelText("Run due recurring rule"),
    ).not.toBeInTheDocument();
  });

  it("shows run due only for active due rules", () => {
    render(<RecurringRuleList rules={[rule]} todayKey="2026-06-01" />);

    expect(screen.getByText("Due")).toBeVisible();
    expect(screen.getByLabelText("Run due recurring rule")).toBeVisible();
  });

  it("does not show run due for inactive rules", () => {
    render(
      <RecurringRuleList
        rules={[{ ...rule, is_active: false }]}
        todayKey="2026-06-01"
      />,
    );

    expect(screen.getByText("Paused")).toBeVisible();
    expect(
      screen.queryByLabelText("Run due recurring rule"),
    ).not.toBeInTheDocument();
  });

  it("renders create defaults", () => {
    render(<RecurringRuleForm accounts={accounts} categories={categories} />);

    expect(screen.getByLabelText("Amount")).toHaveValue("");
    expect(screen.getByLabelText("Account")).toHaveValue("bank");
    expect(screen.getByLabelText("Category")).toHaveValue("rent");
    expect(
      screen.getByRole("button", { name: /save recurring/i }),
    ).toBeEnabled();
  });

  it("renders edit values and validation state", () => {
    resetActionState({
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: {
        next_due_date: "Next date must be on or after the start date.",
      },
    });
    actionStateMock.pending = true;

    render(
      <RecurringRuleForm
        accounts={accounts}
        categories={categories}
        rule={rule}
      />,
    );

    expect(screen.getByLabelText("Amount")).toHaveValue("25000");
    expect(screen.getByLabelText("Frequency")).toHaveValue("monthly");
    expect(screen.getByText("Check the highlighted fields.")).toBeVisible();
    expect(
      screen.getByText("Next date must be on or after the start date."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
