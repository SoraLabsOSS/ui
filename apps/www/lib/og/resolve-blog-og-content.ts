import { getBlogIndexOgContent } from "@/lib/blog/get-blog-index-og-content";
import { blogOgPostsBySlug } from "@/lib/og/blog-og-posts";
import type { BlogOgContent } from "@/lib/og/blog-og-types";
import {
  isValidBlogPostSlug,
  sanitizeBlogOgContent,
} from "@/lib/og/sanitize-blog-og-content";

/**
 * Resolve quote-card content for `/blog-og/.../image.png`.
 * `pageSlug` is the path segments before `image.png`.
 */
export function resolveBlogOgContent(pageSlug: string[]): BlogOgContent | null {
  if (pageSlug.length === 0) {
    return sanitizeBlogOgContent(getBlogIndexOgContent());
  }

  if (pageSlug.length === 1) {
    const slug = pageSlug[0];

    if (!isValidBlogPostSlug(slug)) {
      return null;
    }

    const content = blogOgPostsBySlug[slug];
    if (!content) {
      return null;
    }

    return sanitizeBlogOgContent(content);
  }

  return null;
}
