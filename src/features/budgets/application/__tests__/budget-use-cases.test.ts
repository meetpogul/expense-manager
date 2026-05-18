import { describe, expect, it, vi } from "vitest";

import { CreateBudgetUseCase } from "../use-cases/create-budget.use-case";
import { SetBudgetActiveUseCase } from "../use-cases/set-budget-active.use-case";
import { SoftDeleteBudgetUseCase } from "../use-cases/soft-delete-budget.use-case";
import { UpdateBudgetUseCase } from "../use-cases/update-budget.use-case";

import type { BudgetRepository } from "../ports";

function repository(): BudgetRepository {
  return {
    create: vi.fn(),
    setActive: vi.fn(),
    softDelete: vi.fn(),
    update: vi.fn(),
  };
}

describe("budget use cases", () => {
  it("creates, updates, pauses, and soft deletes through the repository port", async () => {
    const repo = repository();
    const input = {
      amount: 10000,
      categoryId: "food",
      endDate: null,
      isActive: true,
      period: "monthly" as const,
      startDate: "2026-05-01",
    };

    await new CreateBudgetUseCase(repo).execute(input, "user-1");
    await new UpdateBudgetUseCase(repo).execute("budget-1", input);
    await new SetBudgetActiveUseCase(repo).execute("budget-1", false);
    await new SoftDeleteBudgetUseCase(repo).execute(
      "budget-1",
      "2026-05-18T00:00:00.000Z",
    );

    expect(repo.create).toHaveBeenCalledWith({ ...input, userId: "user-1" });
    expect(repo.update).toHaveBeenCalledWith("budget-1", input);
    expect(repo.setActive).toHaveBeenCalledWith("budget-1", false);
    expect(repo.softDelete).toHaveBeenCalledWith(
      "budget-1",
      "2026-05-18T00:00:00.000Z",
    );
  });
});
