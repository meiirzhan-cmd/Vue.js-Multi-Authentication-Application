import bcrypt from "bcryptjs";
import { prisma } from "../database.js";
import type { SafeUser } from "../types/index.js";
import { RedisUtils } from "../utils/redis-utils.js";
import { JWTService } from "./jwt.service.js";

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MAX_FAILED_ATTEMPTS = 5;

  static async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<SafeUser | null> {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name ?? null,
        provider: "LOCAL",
      },
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  static async checkLoginAttempts(email: string): Promise<boolean> {
    const attempts = await RedisUtils.getFailedAttempts(email.toLowerCase());
    return attempts < this.MAX_FAILED_ATTEMPTS;
  }

  static async recordFailedAttempt(email: string): Promise<number> {
    return await RedisUtils.incrementFailedAttempts(email.toLowerCase());
  }

  static async clearFailedAttempts(email: string): Promise<void> {
    await RedisUtils.clearFailedAttempts(email.toLowerCase());
  }

  static async getUserById(id: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async getUserByEmail(email: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async updateUser(
    id: string,
    data: { name?: string; avatar?: string },
  ): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.password) {
      return false;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all existing tokens for security
    await JWTService.revokeAllUserTokens(userId);

    return true;
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      await JWTService.revokeAllUserTokens(userId);
      await prisma.user.delete({ where: { id: userId } });
      return true;
    } catch {
      return false;
    }
  }
}
