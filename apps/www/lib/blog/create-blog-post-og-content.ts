import { BLOG_AUTHORS, type BlogAuthorId } from "@/lib/blog/blog-authors";
import type { BlogOgContent } from "@/lib/og/blog-og-types";

/** Build OG card content for a `/blog/[slug]` article. */
export function createBlogPostOgContent(
  title: string,
  authorId: BlogAuthorId,
  description?: string,
  ogSubtitle?: string
): BlogOgContent {
  const author = BLOG_AUTHORS[authorId];

  return {
    quote: title,
    description: ogSubtitle ?? description,
    author: author.name,
    handle: author.handle,
    avatar: author.avatar,
  };
}
