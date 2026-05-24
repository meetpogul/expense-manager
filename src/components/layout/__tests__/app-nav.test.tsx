import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationMock = vi.hoisted(() => ({
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMock.pathname,
}));

import { AppNav } from "../app-nav";

describe("AppNav", () => {
  beforeEach(() => {
    navigationMock.pathname = "/";
  });

  it("marks only the dashboard link active on the root route", () => {
    render(<AppNav />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /transactions/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks nested transaction routes active", () => {
    navigationMock.pathname = "/transactions/transaction-1/edit";

    render(<AppNav />);

    expect(screen.getByRole("link", { name: /transactions/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).not.toHaveAttribute("aria-current");
  });
});
