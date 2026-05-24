import { describe, expect, it } from "vitest";
import { CalendarDate } from "../calendar-date";
import { DomainError } from "../../domain-error";

describe("CalendarDate", () => {
  describe("from()", () => {
    it("creates CalendarDate from valid format", () => {
      const date = CalendarDate.from("2026-05-15");
      expect(date.value).toBe("2026-05-15");
    });

    it("throws DomainError for bad format", () => {
      expect(() => CalendarDate.from("05/15/2026")).toThrow(DomainError);
      expect(() => CalendarDate.from("05/15/2026")).toThrow(
        "Date must use YYYY-MM-DD format.",
      );
    });

    it("throws DomainError for invalid date (e.g. Feb 30)", () => {
      expect(() => CalendarDate.from("2026-02-30")).toThrow(DomainError);
      expect(() => CalendarDate.from("2026-02-30")).toThrow("Date is invalid.");
    });
  });

  describe("today()", () => {
    it("returns a CalendarDate matching today's date in YYYY-MM-DD", () => {
      const today = CalendarDate.today();
      expect(today.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("isSameMonth()", () => {
    it("returns true if both dates are in the same month and year", () => {
      const d1 = CalendarDate.from("2026-05-10");
      const d2 = CalendarDate.from("2026-05-20");
      expect(d1.isSameMonth(d2)).toBe(true);
    });

    it("returns false if months differ", () => {
      const d1 = CalendarDate.from("2026-05-10");
      const d2 = CalendarDate.from("2026-06-10");
      expect(d1.isSameMonth(d2)).toBe(false);
    });

    it("returns false if years differ", () => {
      const d1 = CalendarDate.from("2026-05-10");
      const d2 = CalendarDate.from("2027-05-10");
      expect(d1.isSameMonth(d2)).toBe(false);
    });
  });

  describe("value / toString()", () => {
    it("returns the raw string value", () => {
      const date = CalendarDate.from("2026-05-15");
      expect(date.value).toBe("2026-05-15");
      expect(date.toString()).toBe("2026-05-15");
    });
  });
});
