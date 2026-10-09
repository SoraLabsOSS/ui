import { cacheLife } from "next/cache";

/** Long-lived cache for MDX, registry, and other build-time static artifacts. */
export function staticContentCacheLife() {
  cacheLife("max");
}
