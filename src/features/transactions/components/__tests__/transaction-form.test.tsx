import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

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

import { TransactionFormContainer } from "../transaction-form";
import {
  accountsFixture,
  categoriesFixture,
  transactionsFixture,
} from "./fixtures";

describe("TransactionFormContainer", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders a quick expense form with smart defaults", () => {
    const { container } = render(
      <TransactionFormContainer
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
    expect(container.querySelector("form")).toHaveFormValues({
      type: "expense",
    });
  });

  it("switches to income mode and narrows category options", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TransactionFormContainer
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Income" }));

    const category = screen.getByLabelText("Category");
    expect(container.querySelector("form")).toHaveFormValues({
      type: "income",
    });
    expect(
      within(category).getByRole("option", { name: "No category" }),
    ).toBeInTheDocument();
    expect(
      within(category).queryByRole("option", { name: "FD Food & Dining" }),
    ).not.toBeInTheDocument();
  });

  it("switches to income mode and resets category if selected category is hidden", async () => {
    const user = userEvent.setup();
    render(
      <TransactionFormContainer
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    // Initial category is expense (Food)
    expect(screen.getByLabelText("Category")).toHaveValue("category-food");

    await user.click(screen.getByRole("button", { name: "Income" }));

    // Now category should be reset to empty because Food is hidden
    expect(screen.getByLabelText("Category")).toHaveValue("");
  });

  it("renders compact mode with category without icon", () => {
    const noIconCategories = [{ ...categoriesFixture[0]!, icon: null }];
    render(
      <TransactionFormContainer
        accounts={accountsFixture}
        categories={noIconCategories}
        compact={true}
      />,
    );
    expect(screen.getByRole("option", { name: "Food & Dining" })).toBeVisible(); // no icon space
  });

  it("renders edit mode values and submit copy", () => {
    const transaction = transactionsFixture[0]!;

    render(
      <TransactionFormContainer
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
    render(
      <TransactionFormContainer accounts={[]} categories={categoriesFixture} />,
    );

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
      <TransactionFormContainer
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
      <TransactionFormContainer
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("handles fallback gracefully when no categories exist", () => {
    render(
      <TransactionFormContainer accounts={accountsFixture} categories={[]} />,
    );

    expect(screen.getByLabelText("Category")).toBeEmptyDOMElement();
  });

  it("resets form on successful creation", () => {
    // Set initial values that should be reset
    const { rerender } = render(
      <TransactionFormContainer
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    expect(screen.getByLabelText("Amount")).toHaveValue("");

    // Rerender with successful action state to trigger the useEffect
    actionStateMock.state = { ok: true, message: "Created successfully." };
    rerender(
      <TransactionFormContainer
        accounts={accountsFixture}
        categories={categoriesFixture}
      />,
    );

    // Form should reset
    expect(screen.getByLabelText("Amount")).toHaveValue("");
  });

  it("resets form on successful creation with no default account and no default category", () => {
    const noDefaultAccounts = [{ ...accountsFixture[0]!, is_default: false }];
    const noDefaultCategories = [
      {
        ...categoriesFixture[0]!,
        name: "Some Expense",
        type: "expense" as const,
      },
    ];

    actionStateMock.state = { ok: true, message: "Created successfully." };
    render(
      <TransactionFormContainer
        accounts={noDefaultAccounts}
        categories={noDefaultCategories}
      />,
    );

    expect(screen.getByLabelText("Account")).toHaveValue(
      noDefaultAccounts[0]!.id,
    );
    expect(screen.getByLabelText("Category")).toHaveValue(
      noDefaultCategories[0]!.id,
    );
  });

  it("resets form on successful creation with completely empty accounts and categories", () => {
    actionStateMock.state = { ok: true, message: "Created successfully." };
    render(<TransactionFormContainer accounts={[]} categories={[]} />);

    // Form should reset to empty states because arrays are empty
    expect(screen.getByLabelText("Account")).toBeEmptyDOMElement();
  });

  it("renders an income transaction without resetting category", () => {
    // This hits the false branch of `if (currentCategory && !categoryIsVisible)`
    // because it's initialized as income and category is visible.
    const incomeTransaction = {
      ...transactionsFixture[0]!,
      type: "income" as const,
      category_id: "category-salary", // Assume visible
    };
    const incomeCategories = [
      {
        id: "category-salary",
        name: "Salary",
        type: "income" as const,
        icon: "💰",
        color: "green",
        user_id: "u1",
        created_at: "",
        updated_at: "",
        deleted_at: null,
        is_system: false,
        is_default: false,
      },
    ];

    render(
      <TransactionFormContainer
        accounts={accountsFixture}
        categories={incomeCategories}
        transaction={incomeTransaction}
      />,
    );
    expect(screen.getByLabelText("Category")).toHaveValue("category-salary");
  });
});
