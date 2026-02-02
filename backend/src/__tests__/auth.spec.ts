import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("Password Hashing", () => {
  const testPassword = "SecurePassword123!";

  describe("bcrypt", () => {
    it("should hash password correctly", async () => {
      const hash = await bcrypt.hash(testPassword, 12);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should verify correct password", async () => {
      const hash = await bcrypt.hash(testPassword, 12);
      const isValid = await bcrypt.compare(testPassword, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const hash = await bcrypt.hash(testPassword, 12);
      const isValid = await bcrypt.compare("WrongPassword", hash);

      expect(isValid).toBe(false);
    });

    it("should generate different hashes for same password", async () => {
      const hash1 = await bcrypt.hash(testPassword, 12);
      const hash2 = await bcrypt.hash(testPassword, 12);

      expect(hash1).not.toBe(hash2);
    });
  });
});

describe("Email Validation", () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it("should validate correct email format", () => {
    expect(emailRegex.test("user@example.com")).toBe(true);
    expect(emailRegex.test("user.name@example.co.uk")).toBe(true);
    expect(emailRegex.test("user+tag@example.com")).toBe(true);
  });

  it("should reject invalid email format", () => {
    expect(emailRegex.test("invalid")).toBe(false);
    expect(emailRegex.test("@example.com")).toBe(false);
    expect(emailRegex.test("user@")).toBe(false);
    expect(emailRegex.test("user @example.com")).toBe(false);
  });
});
