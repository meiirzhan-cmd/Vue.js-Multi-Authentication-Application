import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { JWTService } from "../services/jwt.service.js";

describe("JWTService", () => {
  const testUserId = "user-123";
  const testEmail = "test@example.com";

  describe("generateAccessToken", () => {
    it("should generate a valid JWT access token", () => {
      const token = JWTService.generateAccessToken(testUserId, testEmail);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should include correct payload in access token", () => {
      const token = JWTService.generateAccessToken(testUserId, testEmail);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(testEmail);
      expect(decoded.type).toBe("access");
    });

    it("should set expiration on access token", () => {
      const token = JWTService.generateAccessToken(testUserId, testEmail);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const token = JWTService.generateAccessToken(testUserId, testEmail);
      const payload = JWTService.verifyToken(token);

      expect(payload.userId).toBe(testUserId);
      expect(payload.email).toBe(testEmail);
      expect(payload.type).toBe("access");
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        JWTService.verifyToken("invalid-token");
      }).toThrow();
    });

    it("should throw error for expired token", () => {
      // Create a token that's already expired
      const expiredToken = jwt.sign(
        { userId: testUserId, email: testEmail, type: "access" },
        process.env.JWT_SECRET!,
        { expiresIn: "-1s" }
      );

      expect(() => {
        JWTService.verifyToken(expiredToken);
      }).toThrow();
    });

    it("should throw error for token with wrong secret", () => {
      const tokenWithWrongSecret = jwt.sign(
        { userId: testUserId, email: testEmail, type: "access" },
        "wrong-secret",
        { expiresIn: "15m" }
      );

      expect(() => {
        JWTService.verifyToken(tokenWithWrongSecret);
      }).toThrow();
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", async () => {
      const token = await JWTService.generateRefreshToken(testUserId, testEmail);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should include jti (token id) in refresh token", async () => {
      const token = await JWTService.generateRefreshToken(testUserId, testEmail);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.jti).toBeDefined();
      expect(decoded.type).toBe("refresh");
    });
  });

  describe("generateTokenPair", () => {
    it("should generate both access and refresh tokens", async () => {
      const tokens = await JWTService.generateTokenPair(testUserId, testEmail);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it("should generate tokens with correct types", async () => {
      const tokens = await JWTService.generateTokenPair(testUserId, testEmail);

      const accessDecoded = jwt.decode(tokens.accessToken) as Record<string, unknown>;
      const refreshDecoded = jwt.decode(tokens.refreshToken) as Record<string, unknown>;

      expect(accessDecoded.type).toBe("access");
      expect(refreshDecoded.type).toBe("refresh");
    });
  });
});
