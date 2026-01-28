import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import type { Express, Request, Response, NextFunction } from "express";

export function setupSecurity(app: Express): void {
  // 1. Helmet - Security Headers
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://accounts.google.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: [
            "'self'",
            "https://accounts.google.com",
            "https://oauth2.googleapis.com",
          ],
          frameSrc: ["'self'", "https://accounts.google.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests:
            process.env.NODE_ENV === "production" ? [] : null,
        },
      },
      // HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // Prevent clickjacking
      frameguard: { action: "deny" },
      // Prevent MIME type sniffing
      noSniff: true,
      // XSS Protection (legacy browsers)
      xssFilter: true,
      // Referrer Policy
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      // Don't advertise Express
      hidePoweredBy: true,
    }),
  );

  // 2. CORS Configuration
  const allowedOrigins = new Set([
    process.env.FRONTEND_URL || "http://localhost:5173",
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.has(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
      maxAge: 600, // 10 minutes
    }),
  );

  // 3. Rate Limiting

  // General API rate limit
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: (req) => req.path === "/health",
  });

  // Strict rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many authentication attempts, please try again later.",
    },
    keyGenerator: (req) => {
      // Use email if available, otherwise IP
      return req.body?.email || req.ip || "unknown";
    },
  });

  // Magic link rate limit (prevent email spam)
  const magicLinkLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 magic links per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many magic link requests. Please try again later." },
    keyGenerator: (req) => req.body?.email || req.ip || "unknown",
  });

  app.use("/api", generalLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/magic-link", magicLinkLimiter);

  // 4. Additional Security Headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent caching of sensitive data
    if (req.path.includes("/auth")) {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }

    // Permissions Policy
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    );

    next();
  });
}

// 5. Request Validation Middleware
export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Basic XSS prevention for string inputs
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#x27;")
        .trim();
    }
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}
