import { type Duration, Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW: Duration = "60 s";

/** One `Ratelimit` per (limit, window); each keeps a single `Map` for its lifetime (not recreated per request). */
const ratelimitByConfig = new Map<string, Ratelimit>();

function getRatelimit(limit: number, window: Duration): Ratelimit {
  const key = `${limit}:${window}`;
  let instance = ratelimitByConfig.get(key);
  if (!instance) {
    const isDefault = limit === DEFAULT_LIMIT && window === DEFAULT_WINDOW;
    instance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: isDefault ? "@zola/ratelimit" : `@zola/ratelimit:${key}`,
      // Same Map reused for this config across requests in a warm isolate (Cloudflare Worker).
      ephemeralCache: new Map<string, number>(),
    });
    ratelimitByConfig.set(key, instance);
  }
  return instance;
}

/** Default instance (same as `checkRateLimit` with no options). */
export const ratelimit = getRatelimit(DEFAULT_LIMIT, DEFAULT_WINDOW);

export interface RateLimitOptions {
  limit?: number;
  /** Upstash format, e.g. `"60 s"`, `"1 m"`. */
  window?: Duration;
}

export function checkRateLimit(identifier: string, options?: RateLimitOptions) {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const window = options?.window ?? DEFAULT_WINDOW;
  return getRatelimit(limit, window).limit(identifier);
}
