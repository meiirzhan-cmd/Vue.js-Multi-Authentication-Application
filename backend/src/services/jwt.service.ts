import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import type { JWTPayload } from "../types/index.js";
import { RedisUtils } from "../utils/redis-utils.js";
import { prisma } from "../database.js";

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = "15m";
  private static readonly REFRESH_TOKEN_EXPIRES_IN = "7d";
  private static readonly REFRESH_TOKEN_EXPIRES_SECONDS = 7 * 24 * 60 * 60;

  static generateAccessToken(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      type: "access",
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: "HS256",
    });
  }

  static async generateRefreshToken(userId: string, email: string): Promise<string> {
    const tokenId = uuidv4();

    const payload: JWTPayload = {
      userId,
      email,
      type: "refresh",
    };

    const token = jwt.sign(
      { ...payload, jti: tokenId },
      process.env.JWT_SECRET!,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: "HS256",
      },
    );

    // Store in Redis
    await RedisUtils.storeRefreshToken(
      tokenId,
      userId,
      this.REFRESH_TOKEN_EXPIRES_SECONDS,
    );

    // Store in database for audit trail
    await prisma.refreshToken.create({
      data: {
        token: tokenId,
        userId,
        expiresAt: new Date(
          Date.now() + this.REFRESH_TOKEN_EXPIRES_SECONDS * 1000,
        ),
      },
    });

    return token;
  }

  static async generateTokenPair(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = await this.generateRefreshToken(userId, email);

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload & {
      jti?: string;
    };
  }

  static async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const payload = this.verifyToken(refreshToken) as JWTPayload & {
        jti: string;
      };

      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      // Verify token exists in Redis
      const storedUserId = await RedisUtils.verifyRefreshToken(payload.jti);

      if (!storedUserId || storedUserId !== payload.userId) {
        throw new Error("Invalid refresh token");
      }

      // Revoke old refresh token
      await RedisUtils.revokeRefreshToken(payload.jti, payload.userId);

      // Mark as revoked in database
      await prisma.refreshToken.update({
        where: { token: payload.jti },
        data: { revoked: true },
      });

      // Generate new token pair
      return this.generateTokenPair(payload.userId, payload.email);
    } catch {
      return null;
    }
  }

  static async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      const payload = this.verifyToken(refreshToken) as JWTPayload & {
        jti: string;
      };

      if (payload.type !== "refresh") {
        return false;
      }

      await RedisUtils.revokeRefreshToken(payload.jti, payload.userId);

      await prisma.refreshToken.update({
        where: { token: payload.jti },
        data: { revoked: true },
      });

      return true;
    } catch {
      return false;
    }
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    await RedisUtils.revokeAllUserTokens(userId);

    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
