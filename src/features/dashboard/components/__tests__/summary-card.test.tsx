import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryCard } from "../summary-card";

describe("SummaryCard", () => {
  it("renders with all props (label, value, detail, icon)", () => {
    render(
      <SummaryCard
        label="Total Balance"
        value="$5,000.00"
        detail="Updated just now"
        icon={<svg data-testid="test-icon" />}
      />,
    );

    expect(screen.getByText("Total Balance")).toBeDefined();
    expect(screen.getByText("$5,000.00")).toBeDefined();
    expect(screen.getByText("Updated just now")).toBeDefined();
    expect(screen.getByTestId("test-icon")).toBeDefined();
  });

  it("renders without optional props", () => {
    render(<SummaryCard label="Expenses" value="$200.00" />);

    expect(screen.getByText("Expenses")).toBeDefined();
    expect(screen.getByText("$200.00")).toBeDefined();
    expect(screen.queryByText("Updated just now")).toBeNull();
    expect(screen.queryByTestId("test-icon")).toBeNull();
  });

  it("applies default tone styles to icon container", () => {
    render(
      <SummaryCard
        label="Default Tone"
        value="$0"
        icon={<svg data-testid="test-icon" />}
      />,
    );

    const iconContainer = screen.getByTestId("test-icon").parentElement;
    expect(iconContainer?.className).toContain(
      "bg-secondary text-muted-foreground",
    );
  });

  it("applies income tone styles", () => {
    render(
      <SummaryCard
        label="Income Tone"
        value="$1,000"
        tone="income"
        icon={<svg data-testid="test-icon" />}
      />,
    );

    const iconContainer = screen.getByTestId("test-icon").parentElement;
    expect(iconContainer?.className).toContain("bg-primary/10 text-primary");
  });

  it("applies expense tone styles", () => {
    render(
      <SummaryCard
        label="Expense Tone"
        value="$50"
        tone="expense"
        icon={<svg data-testid="test-icon" />}
      />,
    );

    const iconContainer = screen.getByTestId("test-icon").parentElement;
    expect(iconContainer?.className).toContain(
      "bg-destructive/10 text-destructive",
    );
  });
});
