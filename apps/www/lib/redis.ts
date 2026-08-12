import { Redis } from "@upstash/redis";
import { env, isRedisConfigured } from "@/env";

let redis: Redis | undefined;

export function getRedis(): Redis {
  if (!isRedisConfigured()) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for Redis."
    );
  }

  redis ??= new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return redis;
}
