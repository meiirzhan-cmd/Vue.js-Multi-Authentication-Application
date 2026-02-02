import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../../stores/auth";
import { localStorageMock } from "../setup";

// Mock the API module
vi.mock("../../lib/api.js", () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
    googleLogin: vi.fn(),
    sendMagicLink: vi.fn(),
    verifyMagicLink: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    getMe: vi.fn(),
  },
}));

import { authApi } from "../../lib/api.js";

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  avatar: null,
  emailVerified: true,
  provider: "LOCAL" as const,
  createdAt: "2024-01-01T00:00:00Z",
};

const mockTokens = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
};

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe("Initial State", () => {
    it("should have null user initially", () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
    });

    it("should have isAuthenticated as false when no user", () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });

    it("should load tokens from localStorage on init", () => {
      localStorageMock.store["accessToken"] = "stored-token";
      localStorageMock.store["refreshToken"] = "stored-refresh";

      const store = useAuthStore();
      expect(store.accessToken).toBe("stored-token");
      expect(store.refreshToken).toBe("stored-refresh");
    });
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      vi.mocked(authApi.register).mockResolvedValue({
        data: { user: mockUser, tokens: mockTokens },
      } as never);

      const store = useAuthStore();
      const result = await store.register("test@example.com", "password123", "Test User");

      expect(result).toBe(true);
      expect(store.user).toEqual(mockUser);
      expect(store.accessToken).toBe(mockTokens.accessToken);
      expect(store.refreshToken).toBe(mockTokens.refreshToken);
      expect(store.error).toBeNull();
    });

    it("should handle registration error", async () => {
      vi.mocked(authApi.register).mockRejectedValue({
        response: { data: { error: "Email already exists" } },
      } as never);

      const store = useAuthStore();
      const result = await store.register("test@example.com", "password123");

      expect(result).toBe(false);
      expect(store.user).toBeNull();
      expect(store.error).toBe("Email already exists");
    });

    it("should set loading state during registration", async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(authApi.register).mockReturnValue(promise as never);

      const store = useAuthStore();
      const registerPromise = store.register("test@example.com", "password123");

      expect(store.isLoading).toBe(true);

      resolvePromise!({ data: { user: mockUser, tokens: mockTokens } });
      await registerPromise;

      expect(store.isLoading).toBe(false);
    });

    it("should store tokens in localStorage", async () => {
      vi.mocked(authApi.register).mockResolvedValue({
        data: { user: mockUser, tokens: mockTokens },
      } as never);

      const store = useAuthStore();
      await store.register("test@example.com", "password123");

      expect(localStorageMock.setItem).toHaveBeenCalledWith("accessToken", mockTokens.accessToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("refreshToken", mockTokens.refreshToken);
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { user: mockUser, tokens: mockTokens },
      } as never);

      const store = useAuthStore();
      const result = await store.login("test@example.com", "password123");

      expect(result).toBe(true);
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });

    it("should handle login error with API message", async () => {
      vi.mocked(authApi.login).mockRejectedValue({
        response: { data: { error: "Invalid credentials" } },
      } as never);

      const store = useAuthStore();
      const result = await store.login("test@example.com", "wrongpassword");

      expect(result).toBe(false);
      expect(store.error).toBe("Invalid credentials");
    });

    it("should use fallback error message when no API message", async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error("Network error"));

      const store = useAuthStore();
      const result = await store.login("test@example.com", "password123");

      expect(result).toBe(false);
      expect(store.error).toBe("Login failed");
    });
  });

  describe("sendMagicLink", () => {
    it("should send magic link successfully", async () => {
      vi.mocked(authApi.sendMagicLink).mockResolvedValue({} as never);

      const store = useAuthStore();
      const result = await store.sendMagicLink("test@example.com");

      expect(result).toBe(true);
      expect(authApi.sendMagicLink).toHaveBeenCalledWith("test@example.com");
    });

    it("should handle send magic link error", async () => {
      vi.mocked(authApi.sendMagicLink).mockRejectedValue({
        response: { data: { error: "Email not found" } },
      } as never);

      const store = useAuthStore();
      const result = await store.sendMagicLink("notfound@example.com");

      expect(result).toBe(false);
      expect(store.error).toBe("Email not found");
    });
  });

  describe("verifyMagicLink", () => {
    it("should verify magic link and authenticate user", async () => {
      vi.mocked(authApi.verifyMagicLink).mockResolvedValue({
        data: { user: mockUser, tokens: mockTokens },
      } as never);

      const store = useAuthStore();
      const result = await store.verifyMagicLink("valid-token");

      expect(result).toBe(true);
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });

    it("should handle invalid magic link", async () => {
      vi.mocked(authApi.verifyMagicLink).mockRejectedValue({
        response: { data: { error: "Token expired" } },
      } as never);

      const store = useAuthStore();
      const result = await store.verifyMagicLink("invalid-token");

      expect(result).toBe(false);
      expect(store.error).toBe("Token expired");
    });
  });

  describe("logout", () => {
    it("should clear user and tokens on logout", async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { user: mockUser, tokens: mockTokens },
      } as never);
      vi.mocked(authApi.logout).mockResolvedValue({} as never);

      const store = useAuthStore();
      await store.login("test@example.com", "password123");

      expect(store.user).toEqual(mockUser);

      await store.logout();

      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it("should clear tokens even if API call fails", async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { user: mockUser, tokens: mockTokens },
      } as never);
      vi.mocked(authApi.logout).mockRejectedValue(new Error("Network error"));

      const store = useAuthStore();
      await store.login("test@example.com", "password123");
      await store.logout();

      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
    });

    it("should remove tokens from localStorage", async () => {
      vi.mocked(authApi.logout).mockResolvedValue({} as never);

      const store = useAuthStore();
      store.user = mockUser as never;

      await store.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("accessToken");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("refreshToken");
    });
  });

  describe("logoutAllDevices", () => {
    it("should logout from all devices", async () => {
      vi.mocked(authApi.logoutAll).mockResolvedValue({} as never);

      const store = useAuthStore();
      store.user = mockUser as never;

      await store.logoutAllDevices();

      expect(authApi.logoutAll).toHaveBeenCalled();
      expect(store.user).toBeNull();
      expect(store.accessToken).toBeNull();
    });
  });

  describe("refreshTokens", () => {
    it("should refresh tokens successfully", async () => {
      const newTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };
      vi.mocked(authApi.refreshToken).mockResolvedValue({
        data: newTokens,
      } as never);

      const store = useAuthStore();
      // Set initial refresh token
      store.refreshToken = "old-refresh-token";

      const result = await store.refreshTokens();

      expect(result).toBe(true);
      expect(store.accessToken).toBe(newTokens.accessToken);
      expect(store.refreshToken).toBe(newTokens.refreshToken);
    });

    it("should throw error when no refresh token", async () => {
      const store = useAuthStore();

      await expect(store.refreshTokens()).rejects.toThrow("No refresh token");
    });

    it("should clear tokens on refresh failure", async () => {
      vi.mocked(authApi.refreshToken).mockRejectedValue(new Error("Invalid token"));

      const store = useAuthStore();
      store.refreshToken = "invalid-refresh-token";
      store.accessToken = "old-access-token";

      await expect(store.refreshTokens()).rejects.toThrow();
      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
    });
  });

  describe("fetchUser", () => {
    it("should fetch user when tokens exist", async () => {
      vi.mocked(authApi.getMe).mockResolvedValue({
        data: { user: mockUser },
      } as never);

      const store = useAuthStore();
      store.accessToken = "valid-token";

      await store.fetchUser();

      expect(store.user).toEqual(mockUser);
    });

    it("should not fetch when no tokens", async () => {
      const store = useAuthStore();

      await store.fetchUser();

      expect(authApi.getMe).not.toHaveBeenCalled();
    });

    it("should clear tokens on fetch failure", async () => {
      vi.mocked(authApi.getMe).mockRejectedValue(new Error("Unauthorized"));

      const store = useAuthStore();
      store.accessToken = "invalid-token";
      store.refreshToken = "invalid-refresh";

      await store.fetchUser();

      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
    });
  });

  describe("handleOAuthCallback", () => {
    it("should handle OAuth callback with valid tokens", async () => {
      vi.mocked(authApi.getMe).mockResolvedValue({
        data: { user: mockUser },
      } as never);

      const store = useAuthStore();
      const params = new URLSearchParams({
        accessToken: "oauth-access-token",
        refreshToken: "oauth-refresh-token",
      });

      const result = store.handleOAuthCallback(params);

      expect(result).toBe(true);
      expect(store.accessToken).toBe("oauth-access-token");
      expect(store.refreshToken).toBe("oauth-refresh-token");
    });

    it("should return false when tokens missing", () => {
      const store = useAuthStore();
      const params = new URLSearchParams({});

      const result = store.handleOAuthCallback(params);

      expect(result).toBe(false);
    });

    it("should return false when only accessToken provided", () => {
      const store = useAuthStore();
      const params = new URLSearchParams({
        accessToken: "only-access-token",
      });

      const result = store.handleOAuthCallback(params);

      expect(result).toBe(false);
    });
  });

  describe("isEmailVerified", () => {
    it("should return true when user email is verified", async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { user: { ...mockUser, emailVerified: true }, tokens: mockTokens },
      } as never);

      const store = useAuthStore();
      await store.login("test@example.com", "password123");

      expect(store.isEmailVerified).toBe(true);
    });

    it("should return false when user email is not verified", async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: { user: { ...mockUser, emailVerified: false }, tokens: mockTokens },
      } as never);

      const store = useAuthStore();
      await store.login("test@example.com", "password123");

      expect(store.isEmailVerified).toBe(false);
    });

    it("should return false when no user", () => {
      const store = useAuthStore();
      expect(store.isEmailVerified).toBe(false);
    });
  });
});
