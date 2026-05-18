import { EntityId } from "@/shared/domain/value-objects";

export class AccountId extends EntityId<"account"> {
  private constructor(value: string) {
    super(value, "account");
  }

  static from(value: string) {
    return new AccountId(EntityId.create(value, "account").value);
  }
}
