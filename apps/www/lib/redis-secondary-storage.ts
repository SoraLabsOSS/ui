import { captureException, captureMessage } from "@sentry/nextjs";
import type { SecondaryStorage } from "better-auth";
import redis from "./redis";

const REDIS_STORAGE_COMPONENT = "redis-secondary-storage";
const SENTRY_REPORT_WINDOW_MS = 60_000;

type RedisStorageOperation =
  | "get"
  | "getAndDelete"
  | "set"
  | "delete"
  | "increment";

const lastReportedAt = new Map<string, number>();

function shouldReportToSentry(reportKey: string) {
  const now = Date.now();
  const last = lastReportedAt.get(reportKey) ?? 0;

  if (now - last < SENTRY_REPORT_WINDOW_MS) {
    return false;
  }

  lastReportedAt.set(reportKey, now);
  return true;
}

function captureRedisFailOpen(
  operation: RedisStorageOperation,
  error: unknown
) {
  const reportKey = `${REDIS_STORAGE_COMPONENT}:${operation}`;

  if (!shouldReportToSentry(reportKey)) {
    return;
  }

  captureException(
    error instanceof Error
      ? error
      : new Error(`Redis ${operation} failed: ${String(error)}`),
    {
      level: "warning",
      tags: {
        component: REDIS_STORAGE_COMPONENT,
        operation,
        failOpen: "true",
      },
      fingerprint: [REDIS_STORAGE_COMPONENT, operation],
    }
  );
}

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
      captureRedisFailOpen("get", error);
      return null;
    }
  },

  async getAndDelete(key: string) {
    try {
      return normalizeStoredValue(await redis.getdel(key));
    } catch (error) {
      captureRedisFailOpen("getAndDelete", error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number) {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      if (typeof ttl === "number" && ttl > 0) {
        await redis.set(key, stringValue, { ex: ttl });
      } else {
        // Intentional bounded cache TTL.
        // Durable auth records are stored in Postgres via storeSessionInDatabase/storeInDatabase.
        await redis.set(key, stringValue, { ex: 7 * 24 * 60 * 60 });
      }
    } catch (error) {
      captureRedisFailOpen("set", error);
    }
  },

  async delete(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      captureRedisFailOpen("delete", error);
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

      const reportKey = `${REDIS_STORAGE_COMPONENT}:increment:unexpected-result`;

      if (shouldReportToSentry(reportKey)) {
        captureMessage("Redis increment returned unexpected result", {
          level: "warning",
          tags: {
            component: REDIS_STORAGE_COMPONENT,
            operation: "increment",
            failOpen: "true",
          },
          fingerprint: [
            REDIS_STORAGE_COMPONENT,
            "increment",
            "unexpected-result",
          ],
          extra: {
            resultType: typeof result,
          },
        });
      }
      // Fail open intentionally:
      // If Redis is unavailable, allow the auth request instead of breaking sign-in.
      // Trade-off: rate limiting is bypassed until Redis recovers.
      return 1;
    } catch (error) {
      // Fail open: allow auth when Redis is unavailable (quota, network, etc.).
      captureRedisFailOpen("increment", error);
      return 1;
    }
  },
};
