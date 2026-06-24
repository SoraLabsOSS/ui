import { staticContentCacheLife } from "@/lib/cache/static-content-cache-life";
import { createOgImageResponse } from "@/lib/og/create-og-image-response";
import { resolveOgPage } from "@/lib/og/resolve-og-page";

export async function getCachedOgImageBuffer(
  pageSlug: string[]
): Promise<ArrayBuffer | null> {
  "use cache";
  staticContentCacheLife();
  const content = resolveOgPage(pageSlug);
  if (!content) {
    return null;
  }

  const response = await createOgImageResponse(content);
  return await response.arrayBuffer();
}
