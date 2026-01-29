import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import type { SafeUser } from "../types/index.js";

// Session-based authentication check
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// JWT authentication check
export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error, user: SafeUser, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res
          .status(401)
          .json({ error: info?.message || "Invalid or expired token" });
      }
      req.user = user;
      next();
    },
  )(req, res, next);
}

// Combined: Accept either session or JWT
export function authenticateAny(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // First check session
  if (req.isAuthenticated() && req.user) {
    return next();
  }

  // Then try JWT
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authenticateJWT(req, res, next);
  }

  res.status(401).json({ error: "Authentication required" });
}

// Optional authentication (doesn't fail if not authenticated)
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.isAuthenticated()) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error, user: SafeUser) => {
        if (user) {
          req.user = user;
        }
        next();
      },
    )(req, res, next);
  } else {
    next();
  }
}
