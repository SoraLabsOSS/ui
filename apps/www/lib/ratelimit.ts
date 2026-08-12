import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { isRedisConfigured } from "@/env";
import { getRedis } from "./redis";

const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW: Duration = "60 s";

/** Upstash's ephemeralCache never evicts entries on its own; cap it so high-cardinality identifiers (e.g. per-IP) can't grow it unbounded over a warm isolate's lifetime. */
const MAX_EPHEMERAL_CACHE_ENTRIES = 5000;

function createBoundedEphemeralCache(): Map<string, number> {
  const cache = new Map<string, number>();
  const set = cache.set.bind(cache);
  cache.set = (key: string, value: number) => {
    // Re-inserting an existing key doesn't move it in Map's iteration order, so
    // delete first to bump it to the most-recently-used end before re-adding.
    cache.delete(key);
    if (cache.size >= MAX_EPHEMERAL_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }
    return set(key, value);
  };
  return cache;
}

/** One `Ratelimit` per (limit, window); each keeps a single `Map` for its lifetime (not recreated per request). */
const ratelimitByConfig = new Map<string, Ratelimit>();

function getRatelimit(limit: number, window: Duration): Ratelimit {
  const key = `${limit}:${window}`;
  let instance = ratelimitByConfig.get(key);
  if (!instance) {
    const isDefault = limit === DEFAULT_LIMIT && window === DEFAULT_WINDOW;
    instance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: isDefault ? "@sora/ratelimit" : `@sora/ratelimit:${key}`,
      // Same Map reused for this config across requests on a warm Vercel serverless instance.
      ephemeralCache: createBoundedEphemeralCache(),
    });
    ratelimitByConfig.set(key, instance);
  }
  return instance;
}

export interface RateLimitOptions {
  limit?: number;
  /** Upstash format, e.g. `"60 s"`, `"1 m"`. */
  window?: Duration;
}

const ALLOW_ALL = {
  success: true,
  limit: DEFAULT_LIMIT,
  remaining: DEFAULT_LIMIT,
  reset: Date.now(),
  pending: Promise.resolve(),
};

export function checkRateLimit(identifier: string, options?: RateLimitOptions) {
  if (!isRedisConfigured()) {
    return Promise.resolve(ALLOW_ALL);
  }

  const limit = options?.limit ?? DEFAULT_LIMIT;
  const window = options?.window ?? DEFAULT_WINDOW;
  return getRatelimit(limit, window).limit(identifier);
}

/** Default instance (same as `checkRateLimit` with no options). */
export const ratelimit = {
  limit(identifier: string) {
    return checkRateLimit(identifier);
  },
};
