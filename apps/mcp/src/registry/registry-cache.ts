import { MemoryCache } from "@mcpframework/docs";

/** Registry data is static between deploys — cache aggressively across warm invocations. */
export const REGISTRY_CACHE_TTL_MS = Number(
  process.env.REGISTRY_CACHE_TTL_MS ?? 86_400_000
);

export const REGISTRY_CACHE_MAX_ENTRIES = Number(
  process.env.REGISTRY_CACHE_MAX_ENTRIES ?? 50
);

/** Separate instance from `docsCache` — different key space, tuned independently. */
export const registryCache = new MemoryCache({
  maxEntries: REGISTRY_CACHE_MAX_ENTRIES,
  ttlMs: REGISTRY_CACHE_TTL_MS,
});
