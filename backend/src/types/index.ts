import type { User } from "../../generated/prisma/client.js";

export interface JWTPayload {
  userId: string;
  email: string;
  type: "access" | "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  tokens?: TokenPair;
}

export type SafeUser = Omit<User, "password">;

export interface MagicLinkPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface User extends SafeUser {}
  }
}
