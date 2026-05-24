import { describe, expect, it } from "vitest";
import { EntityId, UserId } from "../entity-id";
import { DomainError } from "../../domain-error";

describe("EntityId", () => {
  describe("create()", () => {
    it("creates EntityId from valid string", () => {
      const id = EntityId.create("test-123", "test");
      expect(id.value).toBe("test-123");
      expect(id.kind).toBe("test");
    });

    it("trims the value", () => {
      const id = EntityId.create("  test-123  ", "test");
      expect(id.value).toBe("test-123");
    });

    it("throws DomainError if empty", () => {
      expect(() => EntityId.create("", "test")).toThrow(DomainError);
      expect(() => EntityId.create("   ", "test")).toThrow(
        "test id is required.",
      );
    });
  });

  describe("equals()", () => {
    it("returns true if values match", () => {
      const id1 = EntityId.create("test-123", "test");
      const id2 = EntityId.create("test-123", "test");
      expect(id1.equals(id2)).toBe(true);
    });

    it("returns false if values differ", () => {
      const id1 = EntityId.create("test-123", "test");
      const id2 = EntityId.create("test-456", "test");
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString()", () => {
    it("returns the raw value", () => {
      const id = EntityId.create("test-123", "test");
      expect(id.toString()).toBe("test-123");
    });
  });
});

describe("UserId", () => {
  describe("from()", () => {
    it("creates UserId and sets kind to user", () => {
      const user = UserId.from("user-123");
      expect(user.value).toBe("user-123");
      expect(user.kind).toBe("user");
    });

    it("throws DomainError if empty", () => {
      expect(() => UserId.from("  ")).toThrow(DomainError);
      expect(() => UserId.from("")).toThrow("user id is required.");
    });
  });
});
