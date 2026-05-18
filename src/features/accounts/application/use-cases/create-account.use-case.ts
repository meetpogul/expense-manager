import type { AccountInput } from "../../domain/account.schema";
import type { AccountRepository } from "../ports";

export class CreateAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  execute(input: AccountInput, userId: string) {
    return this.repository.create({ ...input, userId });
  }
}
