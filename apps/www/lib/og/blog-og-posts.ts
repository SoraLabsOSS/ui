import { createBlogPostOgContent } from "@/lib/blog/create-blog-post-og-content";
import type { BlogOgContent } from "@/lib/og/blog-og-types";

/**
 * Per-post OG content keyed by blog slug (`/blog/[slug]`).
 * `quote` is the article title; avatar comes from the author registry.
 *
 * Use `createBlogPostOgContent` from `@/lib/blog/create-blog-post-og-content`.
 */
export const blogOgPostsBySlug: Record<string, BlogOgContent> = {
  "introducing-sora-ui": createBlogPostOgContent("Introducing Sora UI", "axyl"),
  "motion-first-ui": createBlogPostOgContent(
    "Motion-first UI without the black box",
    "axyl"
  ),
};
