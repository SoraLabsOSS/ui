import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { getBlogOgImageBuffer } from "@/lib/og/get-blog-og-image";

export async function getCachedBlogOgImageBuffer(
  pageSlug: string[]
): Promise<ArrayBuffer | null> {
  "use cache";
  staticContentCacheLife();
  return getBlogOgImageBuffer(pageSlug);
}
