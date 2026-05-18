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

import { AccountForm } from "../account-form";

const accountsFixture = [
  {
    id: "account-cash",
    user_id: "user-1",
    name: "Cash Wallet",
    type: "cash" as const,
    balance: 2500,
    color: null,
    icon: null,
    is_default: false,
    is_active: true,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
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

describe("AccountForm", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("renders create defaults", () => {
    render(<AccountForm />);

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Type")).toHaveValue("bank");
    expect(screen.getByLabelText("Balance")).toHaveValue("0");
    expect(screen.getByRole("button", { name: /save account/i })).toBeEnabled();
  });

  it("renders edit values", () => {
    render(<AccountForm account={accountsFixture[0]} />);

    expect(screen.getByLabelText("Name")).toHaveValue("Cash Wallet");
    expect(screen.getByLabelText("Type")).toHaveValue("cash");
    expect(screen.getByLabelText("Balance")).toHaveValue("2500");
    expect(
      screen.getByRole("button", { name: /update account/i }),
    ).toBeEnabled();
  });

  it("shows validation errors and pending state", () => {
    resetActionState({
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: {
        name: "Account name is required.",
      },
    });
    actionStateMock.pending = true;

    render(<AccountForm />);

    expect(screen.getByText("Check the highlighted fields.")).toBeVisible();
    expect(screen.getByText("Account name is required.")).toBeVisible();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
