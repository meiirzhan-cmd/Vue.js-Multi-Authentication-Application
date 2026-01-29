import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "../lib/api.js";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  emailVerified: boolean;
  provider: "LOCAL" | "GOOGLE" | "MAGIC_LINK";
  createdAt: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const apiErr = err as ApiError;
    return apiErr.response?.data?.error || fallback;
  }
  return fallback;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem("accessToken"));
  const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const isEmailVerified = computed(() => user.value?.emailVerified ?? false);

  // Actions
  async function register(email: string, password: string, name?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.register({ email, password, name });
      setTokens(response.data.tokens);
      user.value = response.data.user;
      return true;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Registration failed");
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.login({ email, password });
      setTokens(response.data.tokens);
      user.value = response.data.user;
      return true;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Login failed");
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function loginWithGoogle() { // NOSONAR - Pinia action must be inside store
    authApi.googleLogin();
  }

  async function sendMagicLink(email: string) {
    isLoading.value = true;
    error.value = null;

    try {
      await authApi.sendMagicLink(email);
      return true;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to send magic link");
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function verifyMagicLink(token: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.verifyMagicLink(token);
      setTokens(response.data.tokens);
      user.value = response.data.user;
      return true;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Invalid or expired magic link");
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshTokens() {
    if (!refreshToken.value) {
      throw new Error("No refresh token");
    }

    try {
      const response = await authApi.refreshToken();
      setTokens(response.data);
      return true;
    } catch (err) {
      clearTokens();
      throw err;
    }
  }

  async function fetchUser() {
    if (!accessToken.value && !refreshToken.value) {
      return;
    }

    isLoading.value = true;

    try {
      const response = await authApi.getMe();
      user.value = response.data.user;
    } catch {
      clearTokens();
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
    } finally {
      clearTokens();
      user.value = null;
    }
  }

  async function logoutAllDevices() {
    try {
      await authApi.logoutAll();
    } catch {
    } finally {
      clearTokens();
      user.value = null;
    }
  }

  function setTokens(tokens: { accessToken: string; refreshToken: string }) {
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }

  function clearTokens() {
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  // Handle OAuth callback
  function handleOAuthCallback(params: URLSearchParams) {
    const access = params.get("accessToken");
    const refresh = params.get("refreshToken");

    if (access && refresh) {
      setTokens({ accessToken: access, refreshToken: refresh });
      fetchUser();
      return true;
    }

    return false;
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isEmailVerified,

    // Actions
    register,
    login,
    loginWithGoogle,
    sendMagicLink,
    verifyMagicLink,
    refreshTokens,
    fetchUser,
    logout,
    logoutAllDevices,
    handleOAuthCallback,
  };
});
