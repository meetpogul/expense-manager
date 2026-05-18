import type { AccountInput } from "../../domain/account.schema";
import type { AccountRepository } from "../ports";

export class UpdateAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  execute(accountId: string, input: AccountInput) {
    return this.repository.update(accountId, input);
  }
}
