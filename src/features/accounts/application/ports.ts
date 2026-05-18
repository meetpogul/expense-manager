import type { AccountInput } from "../domain/account.schema";

export type AccountRepository = {
  create(input: AccountInput & { userId: string }): Promise<void>;
  update(accountId: string, input: AccountInput): Promise<void>;
  softDelete(accountId: string, deletedAt: string): Promise<void>;
};
