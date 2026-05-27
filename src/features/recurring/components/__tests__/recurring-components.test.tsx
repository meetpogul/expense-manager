import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/features/accounts/domain/types";
import type { Category } from "@/features/categories/domain/types";
import type { RecurringRule } from "../../domain/types";

import {
  actionStateMock,
  resetActionState,
} from "@/test/mock-use-action-state";

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

import { RecurringRuleFormContainer } from "../recurring-rule-form";
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

describe("recurring components", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders an empty recurring list state", { timeout: 15000 }, () => {
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
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={categories}
      />,
    );

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
      <RecurringRuleFormContainer
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
  it("renders rule with null note and categories fallback", () => {
    const fallbackRule: RecurringRule = {
      ...rule,
      note: null,
      categories: null,
    };
    render(<RecurringRuleList rules={[fallbackRule]} todayKey="2026-05-18" />);
    expect(screen.getByText("Recurring item")).toBeVisible();
  });

  it("renders rule with null account fallback", () => {
    const noAccountRule: RecurringRule = {
      ...rule,
      accounts: null,
    };
    render(<RecurringRuleList rules={[noAccountRule]} todayKey="2026-05-18" />);
    expect(screen.getByText(/Account/)).toBeVisible();
  });

  it("renders income-type rule with plus sign", () => {
    const incomeRule: RecurringRule = {
      ...rule,
      type: "income",
    };
    render(<RecurringRuleList rules={[incomeRule]} todayKey="2026-05-18" />);
    expect(screen.getByText(/\+₹25,000/)).toBeVisible();
  });

  it("displays execution success message", () => {
    resetActionState({
      ok: true,
      message: "Successfully ran recurring rule.",
    });
    // For this, we just test if the form can show a success message from action state
    // Actually, rule list has no action state. This would be on the rule list if it had a form state?
    // Wait, let's just render the form with a success state to hit the status message display.
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={categories}
      />,
    );
    expect(screen.getByText("Successfully ran recurring rule.")).toBeVisible();
  });

  it("renders edit form button text when not pending", () => {
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={categories}
        rule={rule}
      />,
    );
    expect(
      screen.getByRole("button", { name: /update recurring/i }),
    ).toBeEnabled();
  });

  it("renders with no accounts and no categories (fallbacks)", () => {
    render(<RecurringRuleFormContainer accounts={[]} categories={[]} />);
    expect(screen.getByLabelText("Account")).toBeEmptyDOMElement();
    expect(screen.getByLabelText("Category")).toBeEmptyDOMElement();
    expect(
      screen.getByRole("button", { name: /save recurring/i }),
    ).toBeDisabled();
  });

  it("renders category option without icon", () => {
    const noIconCategories = [{ ...categories[0]!, icon: null }];
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={noIconCategories}
      />,
    );
    expect(
      screen.getByRole("option", { name: "Housing & Rent" }),
    ).toBeVisible(); // no icon space
  });

  it("resets category when changing type and no visible categories exist", async () => {
    const user = userEvent.setup();
    // Start with a category that is ONLY expense
    const onlyExpenseCategories = [
      { ...categories[0]!, type: "expense" as const },
    ];
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={onlyExpenseCategories}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Income" }));
    // In income mode, it should render the "No category" option
    expect(screen.getByRole("option", { name: "No category" })).toBeVisible();
  });

  it("resets category on type switch to income if selected category is hidden", async () => {
    const user = userEvent.setup();
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={categories}
      />,
    );

    // Select the first category (expense)
    expect(screen.getByLabelText("Category")).toHaveValue("rent");

    // Switch to income
    await user.click(screen.getByRole("button", { name: "Income" }));

    // Since "rent" is an expense category, it should be hidden and the value should reset to ""
    expect(screen.getByLabelText("Category")).toHaveValue("");
  });

  it("resets category on type switch to expense if selected category is hidden", async () => {
    const user = userEvent.setup();
    const incomeCategories = [
      ...categories,
      {
        id: "salary",
        user_id: null,
        name: "Salary",
        icon: "SA",
        color: null,
        type: "income" as const,
        is_default: true,
        created_at: "2026-05-01T00:00:00.000Z",
        deleted_at: null,
      },
    ];
    // Start with income rule
    const incomeRule: RecurringRule = {
      ...rule,
      type: "income",
      category_id: "salary",
    };
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={incomeCategories}
        rule={incomeRule}
      />,
    );

    expect(screen.getByLabelText("Category")).toHaveValue("salary");

    // Switch to expense
    await user.click(screen.getByRole("button", { name: "Expense" }));

    // It should reset to the first visible expense category (rent)
    expect(screen.getByLabelText("Category")).toHaveValue("rent");
  });

  it("shows amount field error", () => {
    resetActionState({
      ok: false,
      message: "Check fields",
      fieldErrors: { amount: "Amount must be positive." },
    });
    render(
      <RecurringRuleFormContainer
        accounts={accounts}
        categories={categories}
      />,
    );
    expect(screen.getByText("Amount must be positive.")).toBeVisible();
  });
});
