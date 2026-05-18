import { describe, expect, it, vi } from "vitest";

import { CreateCategoryUseCase } from "../use-cases/create-category.use-case";
import { SoftDeleteCategoryUseCase } from "../use-cases/soft-delete-category.use-case";
import { UpdateCategoryUseCase } from "../use-cases/update-category.use-case";

import type { CategoryRepository } from "../ports";

function repository(): CategoryRepository {
  return {
    create: vi.fn(),
    softDelete: vi.fn(),
    update: vi.fn(),
  };
}

describe("category use cases", () => {
  it("creates, updates, and soft deletes through the repository port", async () => {
    const repo = repository();
    const input = {
      color: "#0ea5e9",
      icon: "utensils",
      name: "Food",
      type: "expense" as const,
    };

    await new CreateCategoryUseCase(repo).execute(input, "user-1");
    await new UpdateCategoryUseCase(repo).execute("category-1", input);
    await new SoftDeleteCategoryUseCase(repo).execute(
      "category-1",
      "2026-05-18T00:00:00.000Z",
    );

    expect(repo.create).toHaveBeenCalledWith({ ...input, userId: "user-1" });
    expect(repo.update).toHaveBeenCalledWith("category-1", input);
    expect(repo.softDelete).toHaveBeenCalledWith(
      "category-1",
      "2026-05-18T00:00:00.000Z",
    );
  });
});
