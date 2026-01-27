import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType;

export async function initRedis(): Promise<RedisClientType> {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error("Redis: Max reconnection attempts reached");
          return new Error("Max reconnection attempts reached");
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on("error", (err) => console.error("Redis Client Error:", err));
  redisClient.on("connect", () => console.log("Redis: Connected"));
  redisClient.on("reconnecting", () => console.log("Redis: Reconnecting..."));

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call initRedis() first.");
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
  }
}
