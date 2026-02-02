import { vi } from "vitest";

// Set test environment variables
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.NODE_ENV = "test";

// Mock Redis utils to avoid needing actual Redis connection
vi.mock("../utils/redis-utils.js", () => ({
  RedisUtils: {
    storeRefreshToken: vi.fn().mockResolvedValue(undefined),
    verifyRefreshToken: vi.fn().mockResolvedValue(null),
    revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    revokeAllUserTokens: vi.fn().mockResolvedValue(undefined),
    getFailedAttempts: vi.fn().mockResolvedValue(0),
    incrementFailedAttempts: vi.fn().mockResolvedValue(1),
    clearFailedAttempts: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock Prisma to avoid needing actual database connection
vi.mock("../database.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    magicLinkToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));
