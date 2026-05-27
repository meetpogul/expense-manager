import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

import { AuthFormContainer } from "../auth-form";

describe("AuthFormContainer", () => {
  beforeEach(() => {
    resetActionState();
  });

  it("starts in sign-in mode", () => {
    const { container } = render(<AuthFormContainer />);
    const modeGroup = screen.getByRole("group", {
      name: "Authentication mode",
    });
    const signInTab = within(modeGroup).getByRole("button", {
      name: "Sign in",
    });
    const createAccountTab = within(modeGroup).getByRole("button", {
      name: "Create account",
    });

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(signInTab).toHaveAttribute("aria-pressed", "true");
    expect(createAccountTab).toHaveAttribute("aria-pressed", "false");

    const formElement = container.querySelector("form");
    expect(formElement).toHaveFormValues({ intent: "signin" });
    expect(
      container.querySelector('button:not([type="button"])'),
    ).toHaveTextContent("Sign in");
  });

  it("toggles create-account mode and updates hidden intent", async () => {
    const user = userEvent.setup();
    const { container } = render(<AuthFormContainer />);
    const modeGroup = screen.getByRole("group", {
      name: "Authentication mode",
    });
    const signInTab = within(modeGroup).getByRole("button", {
      name: "Sign in",
    });
    const createAccountTab = within(modeGroup).getByRole("button", {
      name: "Create account",
    });

    await user.click(createAccountTab);

    expect(signInTab).toHaveAttribute("aria-pressed", "false");
    expect(createAccountTab).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Name")).toBeVisible();

    const formElement = container.querySelector("form");
    expect(formElement).toHaveFormValues({ intent: "signup" });
    expect(
      container.querySelector('button:not([type="button"])'),
    ).toHaveTextContent("Create account");
    expect(actionStateMock.formAction).not.toHaveBeenCalled();

    await user.click(signInTab);

    expect(signInTab).toHaveAttribute("aria-pressed", "true");
    expect(createAccountTab).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(formElement).toHaveFormValues({ intent: "signin" });
    expect(
      container.querySelector('button:not([type="button"])'),
    ).toHaveTextContent("Sign in");
  });

  it("renders server action messages and pending state", () => {
    resetActionState({
      ok: false,
      message: "Invalid login credentials",
    });
    actionStateMock.pending = true;

    render(<AuthFormContainer />);

    expect(screen.getByText("Invalid login credentials")).toBeVisible();
    expect(screen.getByRole("button", { name: /working/i })).toBeDisabled();
  });

  it("renders success messages", () => {
    resetActionState({
      ok: true,
      message: "Account created. Check your email to confirm your sign in.",
    });

    render(<AuthFormContainer />);

    expect(
      screen.getByText(
        "Account created. Check your email to confirm your sign in.",
      ),
    ).toBeVisible();
  });
});
