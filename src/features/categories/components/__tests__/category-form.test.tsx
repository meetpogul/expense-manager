import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { CategoryForm } from "../category-form";

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

function resetActionState(state?: Partial<ActionState>) {
  actionStateMock.formAction = vi.fn();
  actionStateMock.pending = false;
  actionStateMock.state = {
    ok: false,
    message: "",
    ...state,
  };
}

describe("CategoryForm", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders create defaults", () => {
    render(<CategoryForm />);

    expect(screen.getByLabelText("Icon")).toHaveValue("");
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Type")).toHaveValue("expense");
    expect(
      screen.getByRole("button", { name: /save category/i }),
    ).toBeEnabled();
  });

  it("renders edit values", () => {
    render(<CategoryForm category={categoriesFixture[1]} />);

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

    render(<CategoryForm />);

    expect(screen.getByText("Check the highlighted fields.")).toBeVisible();
    expect(screen.getByText("Category name is required.")).toBeVisible();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
