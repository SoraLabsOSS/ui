import { BLOG_AUTHORS, type BlogAuthorId } from "@/lib/blog/blog-authors";
import { createBlogPostOgContent } from "@/lib/blog/create-blog-post-og-content";
import { blog } from "@/lib/blog/source";
import type { BlogOgContent } from "@/lib/og/blog-og-types";

function getAuthorIdFromName(name: string): BlogAuthorId {
  const authorId = Object.entries(BLOG_AUTHORS).find(
    ([, author]) => author.name.toLowerCase() === name.toLowerCase()
  )?.[0];

  return (authorId ?? "axyl") as BlogAuthorId;
}

/**
 * Per-post OG content keyed by blog slug (`/blog/[slug]`).
 * Built from frontmatter so new posts get `/blog-og/[slug]/image.png` automatically.
 */
export const blogOgPostsBySlug: Record<string, BlogOgContent> =
  Object.fromEntries(
    blog.getPages().flatMap((page) => {
      const slug = page.slugs[0];
      if (!slug) {
        return [];
      }

      return [
        [
          slug,
          createBlogPostOgContent(
            page.data.title,
            getAuthorIdFromName(page.data.author ?? "Axyl"),
            page.data.description,
            page.data.ogSubtitle
          ),
        ],
      ];
    })
  );
