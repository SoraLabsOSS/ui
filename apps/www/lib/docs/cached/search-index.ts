import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import {
  getSearchIndexes,
  getStaticSearchDocuments,
} from "@/lib/docs/search-index";

export async function getCachedSearchIndexes() {
  "use cache";
  staticContentCacheLife();
  return await Promise.resolve(getSearchIndexes());
}

export async function getCachedStaticSearchDocuments() {
  "use cache";
  staticContentCacheLife();
  return await Promise.resolve(getStaticSearchDocuments());
}
