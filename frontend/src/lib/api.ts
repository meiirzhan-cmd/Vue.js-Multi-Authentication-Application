import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { useAuthStore } from "../stores/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const authStore = useAuthStore();

      try {
        await authStore.refreshTokens();

        // Retry original request with new token
        if (authStore.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        authStore.logout();
        globalThis.location.href = "/login";
        throw Promise.reject(refreshError);
      }
    }

    throw Promise.reject(error);
  },
);

export default api;

// Auth API functions
export const authApi = {
  // Email/Password
  register: (data: { email: string; password: string; name?: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  // Google OAuth - redirect to backend
  googleLogin: () => {
    globalThis.location.href = `${API_URL}/auth/google`;
  },

  // Magic Link
  sendMagicLink: (email: string) =>
    api.post("/auth/magic-link/send", { email }),

  verifyMagicLink: (token: string) =>
    api.post("/auth/magic-link/verify", { token }),

  // JWT Operations
  refreshToken: () => api.post("/auth/refresh"),

  // Session Operations
  logout: () => api.post("/auth/logout"),

  logoutAll: () => api.post("/auth/logout-all"),

  // User
  getMe: () => api.get("/auth/me"),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.patch("/auth/me", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),
};
