import { describe, expect, it, vi } from "vitest";

import { CreateAccountUseCase } from "../use-cases/create-account.use-case";
import { SoftDeleteAccountUseCase } from "../use-cases/soft-delete-account.use-case";
import { UpdateAccountUseCase } from "../use-cases/update-account.use-case";

import type { AccountRepository } from "../ports";

function repository(): AccountRepository {
  return {
    create: vi.fn(),
    softDelete: vi.fn(),
    update: vi.fn(),
  };
}

describe("account use cases", () => {
  it("creates, updates, and soft deletes through the repository port", async () => {
    const repo = repository();
    const input = { balance: 1000, name: "Cash", type: "cash" as const };

    await new CreateAccountUseCase(repo).execute(input, "user-1");
    await new UpdateAccountUseCase(repo).execute("account-1", input);
    await new SoftDeleteAccountUseCase(repo).execute(
      "account-1",
      "2026-05-18T00:00:00.000Z",
    );

    expect(repo.create).toHaveBeenCalledWith({ ...input, userId: "user-1" });
    expect(repo.update).toHaveBeenCalledWith("account-1", input);
    expect(repo.softDelete).toHaveBeenCalledWith(
      "account-1",
      "2026-05-18T00:00:00.000Z",
    );
  });
});
