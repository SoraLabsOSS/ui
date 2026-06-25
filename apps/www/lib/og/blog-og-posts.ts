import type { BlogOgContent } from "@/lib/og/blog-og-types";

/**
 * Per-post OG content keyed by blog slug (`/blog/[slug]`).
 * `quote` is the article title; avatar comes from the author registry.
 *
 * Use `createBlogPostOgContent` from `@/lib/blog/create-blog-post-og-content`.
 */
export const blogOgPostsBySlug: Record<string, BlogOgContent> = {
  // Example:
  // "cursor-trail-reveal": createBlogPostOgContent(
  //   "How I built Cursor Trail Reveal with Motion and clip-path.",
  //   "axyl"
  // ),
};
