import { EntityId } from "@/shared/domain/value-objects";

export class TransactionId extends EntityId<"transaction"> {
  private constructor(value: string) {
    super(value, "transaction");
  }

  static from(value: string) {
    return new TransactionId(EntityId.create(value, "transaction").value);
  }
}
