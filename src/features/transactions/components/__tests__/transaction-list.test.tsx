import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TransactionList } from "../transaction-list";
import { transactionsFixture } from "./fixtures";

describe("TransactionList", () => {
  const groupedTransactions = [
    { ...transactionsFixture[0]!, date: "2026-05-08" },
    { ...transactionsFixture[1]!, date: "2026-05-07" },
  ];

  it("renders an empty state", () => {
    render(<TransactionList transactions={[]} />);

    expect(screen.getByText("No transactions yet")).toBeVisible();
    expect(
      screen.getByText(
        "Add one transaction and this becomes useful immediately.",
      ),
    ).toBeVisible();
  });

  it("groups full transaction rows and shows edit/delete controls", () => {
    render(<TransactionList transactions={groupedTransactions} />);

    expect(screen.getByText("Fri, 8 May")).toBeVisible();
    expect(screen.getByText("Thu, 7 May")).toBeVisible();
    expect(screen.getByText("Swiggy")).toBeVisible();
    expect(screen.getByText("May salary")).toBeVisible();
    expect(screen.getByText("Food & Dining")).toBeVisible();
    expect(screen.getByText("Salary")).toBeVisible();
    expect(screen.getAllByLabelText("Edit transaction")).toHaveLength(2);
    expect(screen.getAllByLabelText("Delete transaction")).toHaveLength(2);
    expect(
      screen.getByText(
        (content) => content.startsWith("-") && content.includes("450"),
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        (content) => content.startsWith("+") && content.includes("60,000"),
      ),
    ).toBeVisible();
  });

  it("hides date groups and row actions in compact mode", () => {
    render(<TransactionList compact transactions={groupedTransactions} />);

    expect(screen.queryByText("Fri, 8 May")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Edit transaction")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Delete transaction"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Swiggy")).toBeVisible();
  });

  it("falls back to category or generic transaction labels", () => {
    render(
      <TransactionList
        transactions={[
          {
            ...transactionsFixture[0]!,
            id: "category-fallback",
            merchant_name: null,
            note: null,
          },
          {
            ...transactionsFixture[0]!,
            id: "generic-fallback",
            merchant_name: null,
            note: null,
            categories: null,
          },
          {
            ...transactionsFixture[0]!,
            id: "account-fallback",
            merchant_name: null,
            note: null,
            accounts: null,
          },
        ]}
      />,
    );

    expect(screen.getAllByText("Food & Dining").length).toBeGreaterThan(0);
    expect(screen.getByText("Transaction")).toBeVisible();
    expect(screen.getByText(/Account -/)).toBeVisible();
  });
});
