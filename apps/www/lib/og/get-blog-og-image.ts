import { createBlogOgImageResponse } from "@/lib/og/create-blog-og-image-response";
import { resolveBlogOgContent } from "@/lib/og/resolve-blog-og-content";

export async function getBlogOgImageBuffer(
  pageSlug: string[]
): Promise<ArrayBuffer | null> {
  const content = resolveBlogOgContent(pageSlug);
  if (!content) {
    return null;
  }

  try {
    return await (await createBlogOgImageResponse(content)).arrayBuffer();
  } catch {
    return await (
      await createBlogOgImageResponse({ ...content, avatar: undefined })
    ).arrayBuffer();
  }
}
