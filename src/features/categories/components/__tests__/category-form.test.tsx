import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { CategoryFormContainer } from "../category-form";

const categoriesFixture = [
  {
    id: "category-food",
    user_id: null,
    name: "Food & Dining",
    icon: "FD",
    color: null,
    type: "expense" as const,
    is_default: true,
    created_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: "category-misc",
    user_id: "user-1",
    name: "Miscellaneous",
    icon: "MI",
    color: null,
    type: "both" as const,
    is_default: false,
    created_at: "2026-05-01T00:00:00.000Z",
    deleted_at: null,
  },
];

describe("CategoryFormContainer", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders create defaults", { timeout: 15000 }, () => {
    render(<CategoryFormContainer />);

    expect(screen.getByLabelText("Icon")).toHaveValue("");
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Type")).toHaveValue("expense");
    expect(
      screen.getByRole("button", { name: /save category/i }),
    ).toBeEnabled();
  });

  it("renders edit values", () => {
    render(<CategoryFormContainer category={categoriesFixture[1]} />);

    expect(screen.getByLabelText("Icon")).toHaveValue("MI");
    expect(screen.getByLabelText("Name")).toHaveValue("Miscellaneous");
    expect(screen.getByLabelText("Type")).toHaveValue("both");
    expect(
      screen.getByRole("button", { name: /update category/i }),
    ).toBeEnabled();
  });

  it("shows validation errors and pending state", () => {
    resetActionState({
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: {
        name: "Category name is required.",
      },
    });
    actionStateMock.pending = true;

    render(<CategoryFormContainer />);

    expect(screen.getByText("Check the highlighted fields.")).toBeVisible();
    expect(screen.getByText("Category name is required.")).toBeVisible();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
