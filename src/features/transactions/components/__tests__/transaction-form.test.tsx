import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type { ActionState } from "@/lib/actions/state";

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

import { TransactionForm } from "../transaction-form";
import {
  accountsFixture,
  categoriesFixture,
  transactionsFixture,
} from "./fixtures";

function resetActionState(state?: Partial<ActionState>) {
  actionStateMock.formAction = vi.fn();
  actionStateMock.pending = false;
  actionStateMock.state = {
    ok: false,
    message: "",
    ...state,
  };
}

describe("TransactionForm", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders a quick expense form with smart defaults", () => {
    const { container } = render(
      <TransactionForm
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    expect(screen.getByRole("button", { name: "Expense" })).toHaveClass(
      "bg-background",
    );
    expect(screen.getByLabelText("Amount")).toHaveFocus();
    expect(screen.getByLabelText("Account")).toHaveValue("account-bank");
    expect(screen.getByLabelText("Category")).toHaveValue("category-food");
    expect(
      screen.getByRole("button", { name: /save transaction/i }),
    ).toBeEnabled();
    expect(container.querySelector('input[name="type"]')).toHaveValue(
      "expense",
    );
  });

  it("switches to income mode and narrows category options", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TransactionForm
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Income" }));

    const category = screen.getByLabelText("Category");
    expect(container.querySelector('input[name="type"]')).toHaveValue("income");
    expect(
      within(category).getByRole("option", { name: "No category" }),
    ).toBeInTheDocument();
    expect(
      within(category).getByRole("option", { name: "SA Salary" }),
    ).toBeInTheDocument();
    expect(
      within(category).queryByRole("option", { name: "FD Food & Dining" }),
    ).not.toBeInTheDocument();
  });

  it("renders edit mode values and submit copy", () => {
    const transaction = transactionsFixture[0]!;

    render(
      <TransactionForm
        accounts={accountsFixture}
        categories={categoriesFixture}
        transaction={transaction}
      />,
    );

    expect(screen.getByLabelText("Amount")).toHaveValue("450");
    expect(screen.getByLabelText("Account")).toHaveValue("account-bank");
    expect(screen.getByLabelText("Category")).toHaveValue("category-food");
    expect(screen.getByLabelText("Merchant")).toHaveValue("Swiggy");
    expect(screen.getByLabelText("Note")).toHaveValue("Dinner");
    expect(
      screen.getByRole("button", { name: /update transaction/i }),
    ).toBeEnabled();
  });

  it("disables submit when no account exists", () => {
    render(<TransactionForm accounts={[]} categories={categoriesFixture} />);

    expect(
      screen.getByRole("button", { name: /save transaction/i }),
    ).toBeDisabled();
  });

  it("shows server action field errors and status messages", () => {
    resetActionState({
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: {
        amount: "Enter an amount greater than 0.",
        account_id: "Choose an account.",
      },
    });

    render(
      <TransactionForm
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    expect(screen.getByText("Check the highlighted fields.")).toBeVisible();
    expect(screen.getByText("Enter an amount greater than 0.")).toBeVisible();
    expect(screen.getByText("Choose an account.")).toBeVisible();
  });

  it("shows pending state from useActionState", () => {
    actionStateMock.pending = true;

    render(
      <TransactionForm
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("handles fallback gracefully when no categories exist", () => {
    render(<TransactionForm accounts={accountsFixture} categories={[]} />);

    expect(screen.getByLabelText("Category")).toBeEmptyDOMElement();
  });
});
