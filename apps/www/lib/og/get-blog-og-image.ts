import { createBlogOgImageResponse } from "@/lib/og/create-blog-og-image-response";
import { resolveBlogOgContent } from "@/lib/og/resolve-blog-og-content";

export async function getBlogOgImageBuffer(
  pageSlug: string[]
): Promise<ArrayBuffer | null> {
  const content = resolveBlogOgContent(pageSlug);
  if (!content) {
    return null;
  }

  const response = await createBlogOgImageResponse(content);
  return await response.arrayBuffer();
}
