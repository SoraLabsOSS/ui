import { cacheLife } from "next/cache";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/** Docs/blog/catalog page renders — revalidate every 30 days instead of on every request. */
export function pageContentCacheLife() {
  cacheLife({
    stale: 60 * 60,
    revalidate: THIRTY_DAYS_SECONDS,
    expire: THIRTY_DAYS_SECONDS,
  });
}
