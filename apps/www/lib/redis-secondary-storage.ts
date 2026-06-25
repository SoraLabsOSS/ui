import { captureException, captureMessage } from "@sentry/nextjs";
import type { SecondaryStorage } from "better-auth";
import redis from "./redis";

const REDIS_STORAGE_COMPONENT = "redis-secondary-storage";
const SENTRY_REPORT_WINDOW_MS = 60_000;
const FALLBACK_INCREMENT_MAX_ENTRIES = 10_000;

type RedisStorageOperation =
  | "get"
  | "getAndDelete"
  | "set"
  | "delete"
  | "increment";

interface FallbackIncrementEntry {
  count: number;
  expiresAt: number;
}

const lastReportedAt = new Map<string, number>();
const fallbackIncrements = new Map<string, FallbackIncrementEntry>();

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

function captureIncrementFallback(
  reason: "error" | "unexpected-result",
  error?: unknown
) {
  const reportKey = `${REDIS_STORAGE_COMPONENT}:increment:fallback:${reason}`;

  if (!shouldReportToSentry(reportKey)) {
    return;
  }

  if (reason === "error" && error !== undefined) {
    captureException(
      error instanceof Error
        ? error
        : new Error(`Redis increment failed: ${String(error)}`),
      {
        level: "warning",
        tags: {
          component: REDIS_STORAGE_COMPONENT,
          operation: "increment",
          fallback: "in-memory",
        },
        fingerprint: [REDIS_STORAGE_COMPONENT, "increment", "fallback"],
      }
    );
    return;
  }

  captureMessage(
    "Redis increment returned unexpected result; using in-memory fallback",
    {
      level: "warning",
      tags: {
        component: REDIS_STORAGE_COMPONENT,
        operation: "increment",
        fallback: "in-memory",
      },
      fingerprint: [REDIS_STORAGE_COMPONENT, "increment", "fallback"],
    }
  );
}

function pruneFallbackIncrements(now = Date.now()) {
  for (const [key, entry] of fallbackIncrements) {
    if (now >= entry.expiresAt) {
      fallbackIncrements.delete(key);
    }
  }

  if (fallbackIncrements.size <= FALLBACK_INCREMENT_MAX_ENTRIES) {
    return;
  }

  const overflow = fallbackIncrements.size - FALLBACK_INCREMENT_MAX_ENTRIES;
  let removed = 0;

  for (const key of fallbackIncrements.keys()) {
    fallbackIncrements.delete(key);
    if (++removed >= overflow) {
      break;
    }
  }
}

/**
 * Local INCR + TTL window when Redis is unavailable.
 * Per-instance only (serverless), but still enforces limits during Redis outages.
 */
function incrementWithLocalFallback(key: string, ttlSeconds: number): number {
  const now = Date.now();
  const ttlMs = Math.max(1, ttlSeconds) * 1000;

  pruneFallbackIncrements(now);

  const existing = fallbackIncrements.get(key);

  if (!existing || now >= existing.expiresAt) {
    fallbackIncrements.set(key, { count: 1, expiresAt: now + ttlMs });
    return 1;
  }

  const count = existing.count + 1;
  fallbackIncrements.set(key, { count, expiresAt: existing.expiresAt });
  return count;
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

      captureIncrementFallback("unexpected-result");
      return incrementWithLocalFallback(key, ttl);
    } catch (error) {
      captureIncrementFallback("error", error);
      return incrementWithLocalFallback(key, ttl);
    }
  },
};
