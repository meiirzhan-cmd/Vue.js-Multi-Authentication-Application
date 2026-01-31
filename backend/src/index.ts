import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import passport from "passport";
import { initRedis, closeRedis } from "./config/redis.js";
import { createSessionMiddleware } from "./config/session.js";
import { setupSecurity, sanitizeInput } from "./middleware/security.js";
import authRoutes from "./routes/auth.routes.js";

async function bootstrap() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Initialize Redis
  await initRedis();
  console.log("✅ Redis connected");

  // Trust proxy (for production behind load balancer)
  app.set("trust proxy", 1);

  // Security middleware
  setupSecurity(app);

  // Body parsing
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());

  // Input sanitization
  app.use(sanitizeInput);

  // Session middleware
  app.use(createSessionMiddleware());

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use("/api/auth", authRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error handler
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Error:", err);
      res.status(500).json({
        error:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
      });
    },
  );

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\nShutting down...");
    server.close(async () => {
      await closeRedis();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
