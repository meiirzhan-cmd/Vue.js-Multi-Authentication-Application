import { getRedisClient } from "../config/redis.js";

export class RedisUtils {
  // Store magic link token
  static async storeMagicLinkToken(
    token: string,
    userId: string,
    expiresInSeconds: number,
  ): Promise<void> {
    const client = getRedisClient();
    await client.setEx(`magic-link:${token}`, expiresInSeconds, userId);
  }

  // Verify and consume magic link token
  static async consumeMagicLinkToken(token: string): Promise<string | null> {
    const client = getRedisClient();
    const key = `magic-link:${token}`;

    const userId = await client.get(key);
    if (userId) {
      await client.del(key);
    }
    return userId;
  }

  // Store refresh token
  static async storeRefreshToken(
    token: string,
    userId: string,
    expiresInSeconds: number,
  ): Promise<void> {
    const client = getRedisClient();
    await client.setEx(`refresh-token:${token}`, expiresInSeconds, userId);
    // Add to user's refresh token set
    await client.sAdd(`user-refresh-tokens:${userId}`, token);
  }

  // Verify refresh token
  static async verifyRefreshToken(token: string): Promise<string | null> {
    const client = getRedisClient();
    return await client.get(`refresh-token:${token}`);
  }

  // Revoke refresh token
  static async revokeRefreshToken(
    token: string,
    userId: string,
  ): Promise<void> {
    const client = getRedisClient();
    await client.del(`refresh-token:${token}`);
    await client.sRem(`user-refresh-tokens:${userId}`, token);
  }

  // Revoke all user refresh tokens (logout all devices)
  static async revokeAllUserTokens(userId: string): Promise<void> {
    const client = getRedisClient();
    const tokens = await client.sMembers(`user-refresh-tokens:${userId}`);

    if (tokens.length > 0) {
      const pipeline = client.multi();
      tokens.forEach((token) => pipeline.del(`refresh-token:${token}`));
      pipeline.del(`user-refresh-tokens:${userId}`);
      await pipeline.exec();
    }
  }

  // Rate limiting
  static async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const client = getRedisClient();
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, windowSeconds);
    }

    return current <= limit;
  }

  // Store failed login attempts
  static async incrementFailedAttempts(email: string): Promise<number> {
    const client = getRedisClient();
    const key = `failed-attempts:${email}`;
    const attempts = await client.incr(key);

    if (attempts === 1) {
      await client.expire(key, 900); // 15 minutes
    }

    return attempts;
  }

  static async getFailedAttempts(email: string): Promise<number> {
    const client = getRedisClient();
    const attempts = await client.get(`failed-attempts:${email}`);
    return attempts ? Number.parseInt(attempts, 10) : 0;
  }

  static async clearFailedAttempts(email: string): Promise<void> {
    const client = getRedisClient();
    await client.del(`failed-attempts:${email}`);
  }
}
