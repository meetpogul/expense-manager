import type { AccountRepository } from "../ports";

export class SoftDeleteAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  execute(accountId: string, deletedAt: string) {
    return this.repository.softDelete(accountId, deletedAt);
  }
}
