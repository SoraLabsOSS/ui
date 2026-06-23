import type { SecondaryStorage } from "better-auth";
import redis from "./redis";

/** INCR + EXPIRE only on first hit — matches Better Auth `SecondaryStorage.increment` contract. */
const INCREMENT_WITH_TTL_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return current
`;

function normalizeStoredValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export const redisSecondaryStorage: SecondaryStorage = {
  async get(key: string) {
    try {
      return normalizeStoredValue(await redis.get(key));
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  },

  async getAndDelete(key: string) {
    try {
      return normalizeStoredValue(await redis.getdel(key));
    } catch (error) {
      console.error("Redis getAndDelete error:", error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number) {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      if (ttl) {
        await redis.set(key, stringValue, { ex: ttl });
      } else {
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

  async increment(key: string, ttl: number) {
    try {
      const result = await redis.eval(
        INCREMENT_WITH_TTL_SCRIPT,
        [key],
        [String(ttl)]
      );

      if (typeof result === "number") {
        return result;
      }

      const parsed = Number(result);
      if (Number.isFinite(parsed)) {
        return parsed;
      }

      throw new TypeError(`Unexpected increment result for key "${key}"`);
    } catch (error) {
      console.error("Redis increment error:", error);
      throw error;
    }
  },
};
