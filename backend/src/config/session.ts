import session from "express-session";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "./redis.js";

export function createSessionMiddleware() {
  const redisClient = getRedisClient();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "session:",
    ttl: 86400, // 24 hours in seconds
  });

  return session({
    store: redisStore,
    secret: process.env.SESSION_SECRET!,
    name: "sid", // Custom cookie name (not 'connect.sid')
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on each request
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      domain:
        process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined,
    },
  });
}
