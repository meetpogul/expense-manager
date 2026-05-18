import { DomainError } from "../domain-error";

export class EntityId<TKind extends string> {
  protected constructor(
    private readonly rawValue: string,
    readonly kind: TKind,
  ) {}

  static create<TKind extends string>(value: string, kind: TKind) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new DomainError(`${kind} id is required.`, "entity_id.required");
    }

    return new EntityId(trimmed, kind);
  }

  get value() {
    return this.rawValue;
  }

  equals(other: EntityId<TKind>) {
    return this.rawValue === other.rawValue;
  }

  toString() {
    return this.rawValue;
  }
}

export class UserId extends EntityId<"user"> {
  private constructor(value: string) {
    super(value, "user");
  }

  static from(value: string) {
    return new UserId(EntityId.create(value, "user").value);
  }
}
