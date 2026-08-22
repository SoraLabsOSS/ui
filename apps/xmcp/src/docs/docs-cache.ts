import { MemoryCache } from "../lib/memory-cache";

/** Docs are static between deploys — cache aggressively across warm invocations. */
export const DOCS_CACHE_TTL_MS = Number(
  process.env.DOCS_CACHE_TTL_MS ?? 86_400_000
);

export const DOCS_CACHE_MAX_ENTRIES = Number(
  process.env.DOCS_CACHE_MAX_ENTRIES ?? 500
);

export const docsCache = new MemoryCache({
  maxEntries: DOCS_CACHE_MAX_ENTRIES,
  ttlMs: DOCS_CACHE_TTL_MS,
});
