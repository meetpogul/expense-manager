import { EntityId } from "@/shared/domain/value-objects";

export class CategoryId extends EntityId<"category"> {
  private constructor(value: string) {
    super(value, "category");
  }

  static from(value: string) {
    return new CategoryId(EntityId.create(value, "category").value);
  }
}
