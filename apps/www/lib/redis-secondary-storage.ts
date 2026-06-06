import type { SecondaryStorage } from "better-auth";
import redis from "./redis";

export const redisSecondaryStorage: SecondaryStorage = {
  async get(key: string) {
    try {
      const value = await redis.get(key);

      // Handle different return types from Redis
      if (value === null || value === undefined) {
        return null;
      }

      // If it's already a string, return it
      if (typeof value === "string") {
        return value;
      }

      // If it's an object, stringify it
      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      // Convert to string for any other type
      return String(value);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number) {
    try {
      // Ensure value is a string
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      if (ttl) {
        // Set with TTL in seconds
        await redis.set(key, stringValue, { ex: ttl });
      } else {
        // Set without TTL
        await redis.set(key, stringValue, { ex: 7 * 24 * 60 * 60 });
      }
    } catch (error) {
      console.error("Redis set error:", error);
    }
  },

  async delete(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Redis delete error:", error);
    }
  },
};
