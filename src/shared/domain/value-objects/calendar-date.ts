import { DomainError } from "../domain-error";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export class CalendarDate {
  private constructor(private readonly rawValue: string) {}

  static from(value: string) {
    if (!datePattern.test(value)) {
      throw new DomainError(
        "Date must use YYYY-MM-DD format.",
        "calendar_date.format",
      );
    }

    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
    ) {
      throw new DomainError("Date is invalid.", "calendar_date.invalid");
    }

    return new CalendarDate(value);
  }

  static today() {
    return new CalendarDate(new Date().toISOString().slice(0, 10));
  }

  get value() {
    return this.rawValue;
  }

  isSameMonth(other: CalendarDate) {
    return this.rawValue.slice(0, 7) === other.rawValue.slice(0, 7);
  }

  toString() {
    return this.rawValue;
  }
}
