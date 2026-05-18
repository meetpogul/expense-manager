import { render, screen } from "@testing-library/react";
import { CircleIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { ActionStatus } from "@/components/ui/action-status";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { TransactionFilters } from "../transaction-filters";
import { categoriesFixture } from "./fixtures";

describe("ActionStatus", () => {
  it("renders nothing without a message", () => {
    const { container } = render(
      <ActionStatus state={{ ok: false, message: "" }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders success and error messages", () => {
    const { rerender } = render(
      <ActionStatus state={{ ok: true, message: "Saved." }} />,
    );

    expect(screen.getByText("Saved.")).toBeVisible();

    rerender(
      <ActionStatus state={{ ok: false, message: "Could not save." }} />,
    );

    expect(screen.getByText("Could not save.")).toBeVisible();
  });
});

describe("SummaryCard", () => {
  it("renders summary values, detail, and icons", () => {
    render(
      <SummaryCard
        detail="Current month"
        icon={<CircleIcon aria-label="summary icon" />}
        label="Income"
        tone="income"
        value="60000"
      />,
    );

    expect(screen.getByText("Income")).toBeVisible();
    expect(screen.getByText("60000")).toBeVisible();
    expect(screen.getByText("Current month")).toBeVisible();
    expect(screen.getByLabelText("summary icon")).toBeVisible();
  });
});

describe("TransactionFilters", () => {
  it("renders selected filters and category options", () => {
    render(
      <TransactionFilters
        categories={categoriesFixture}
        categoryId="category-food"
        from="2026-05-01"
        to="2026-05-10"
        type="expense"
      />,
    );

    expect(screen.getByLabelText("Type")).toHaveValue("expense");
    expect(screen.getByLabelText("Category")).toHaveValue("category-food");
    expect(screen.getByLabelText("From date")).toHaveValue("2026-05-01");
    expect(screen.getByLabelText("To date")).toHaveValue("2026-05-10");
    expect(
      screen.getByRole("option", { name: "Food & Dining" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /filter/i })).toBeVisible();
  });

  it("renders with default/empty state when no filters are selected", () => {
    render(<TransactionFilters categories={categoriesFixture} />);

    expect(screen.getByLabelText("Type")).toHaveValue("all");
    expect(screen.getByLabelText("Category")).toHaveValue("all");
    expect(screen.getByLabelText("From date")).toHaveValue("");
    expect(screen.getByLabelText("To date")).toHaveValue("");
  });
});
