import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { AuthService } from "../services/auth.service.js";
import { JWTService } from "../services/jwt.service.js";
import { authenticateAny } from "../middleware/auth.js";
import {
  validateLogin,
  validateMagicLink,
  validateRegistration,
} from "../middleware/validation.js";
import type { SafeUser } from "../types/index.js";
import { MagicLinkService } from "../services/magic-link.service.js";

const router = Router();

// ============================================
// Registration (Email/Password)
// ============================================
router.post(
  "/register",
  validateRegistration,
  async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    const user = await AuthService.register(email, password, name);

    if (!user) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const tokens = await JWTService.generateTokenPair(user.id, user.email);

    // Also create session
    req.login(user, (err) => {
      if (err) {
        console.error("Session creation error:", err);
      }
    });

    res.status(201).json({ user, tokens });
  },
);

// ============================================
// Login (Email/Password)
// ============================================
router.post(
  "/login",
  validateLogin,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Check rate limiting
    const canAttempt = await AuthService.checkLoginAttempts(email);
    if (!canAttempt) {
      return res
        .status(429)
        .json({ error: "Too many failed attempts. Please try again later." });
    }

    passport.authenticate(
      "local",
      async (err: Error, user: SafeUser, info: any) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          await AuthService.recordFailedAttempt(email);
          return res
            .status(401)
            .json({ error: info?.message || "Invalid credentials" });
        }

        // Clear failed attempts on success
        await AuthService.clearFailedAttempts(email);

        // Generate tokens
        const tokens = await JWTService.generateTokenPair(user.id, user.email);

        // Create session
        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          res.json({ user, tokens });
        });
      },
    )(req, res, next);
  },
);

// ============================================
// Google OAuth
// ============================================
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=oauth_failed",
  }),
  async (req: Request, res: Response) => {
    const user = req.user as SafeUser;
    const tokens = await JWTService.generateTokenPair(user.id, user.email);

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set("accessToken", tokens.accessToken);
    redirectUrl.searchParams.set("refreshToken", tokens.refreshToken);

    res.redirect(redirectUrl.toString());
  },
);

// ============================================
// Magic Link
// ============================================
router.post(
  "/magic-link/send",
  validateMagicLink,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const success = await MagicLinkService.sendMagicLink(email);

    if (!success) {
      return res.status(500).json({ error: "Failed to send magic link" });
    }

    res.json({ message: "Magic link sent" });
  },
);

router.post("/magic-link/verify", async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const result = await MagicLinkService.verifyMagicLink(token);

  if (!result) {
    return res.status(401).json({ error: "Invalid or expired magic link" });
  }

  const user = await AuthService.getUserById(result.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const tokens = await JWTService.generateTokenPair(user.id, user.email);

  // Create session
  req.login(user, (err) => {
    if (err) {
      console.error("Session creation error:", err);
    }
  });

  res.json({ user, tokens });
});

// ============================================
// Token Refresh (JWT)
// ============================================
router.post("/refresh", async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  const tokens = await JWTService.refreshTokens(refreshToken);

  if (!tokens) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  res.json(tokens);
});

// ============================================
// Get Current User
// ============================================
router.get("/me", authenticateAny, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// ============================================
// Update Profile
// ============================================
router.patch("/me", authenticateAny, async (req: Request, res: Response) => {
  const { name, avatar } = req.body;
  const userId = (req.user as SafeUser).id;

  const user = await AuthService.updateUser(userId, { name, avatar });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

// ============================================
// Change Password
// ============================================
router.post(
  "/change-password",
  authenticateAny,
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as SafeUser).id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new password required" });
    }

    const success = await AuthService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    if (!success) {
      return res.status(400).json({ error: "Invalid current password" });
    }

    res.json({ message: "Password changed successfully" });
  },
);

// ============================================
// Logout (current session/token)
// ============================================
router.post("/logout", authenticateAny, async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

  // Revoke refresh token if provided
  if (refreshToken) {
    await JWTService.revokeRefreshToken(refreshToken);
  }

  // Destroy session
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
  });

  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
  });

  res.clearCookie("sid");
  res.json({ message: "Logged out" });
});

// ============================================
// Logout All Devices
// ============================================
router.post(
  "/logout-all",
  authenticateAny,
  async (req: Request, res: Response) => {
    const userId = (req.user as SafeUser).id;

    await JWTService.revokeAllUserTokens(userId);

    // Destroy current session
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
    });

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
    });

    res.clearCookie("sid");
    res.json({ message: "Logged out from all devices" });
  },
);

export default router;
