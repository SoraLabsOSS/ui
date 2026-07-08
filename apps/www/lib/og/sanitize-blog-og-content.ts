import type { BlogOgContent } from "@/lib/og/blog-og-types";

export const BLOG_OG_QUOTE_MAX_LENGTH = 200;
/** One-line hook under short titles on OG images (wraps to ~2 lines). */
export const BLOG_OG_SUBTITLE_MAX_LENGTH = 130;
export const BLOG_OG_AUTHOR_MAX_LENGTH = 80;
export const BLOG_OG_HANDLE_MAX_LENGTH = 64;

export const BLOG_POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function trimToMaxLength(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

/**
 * Trim OG subtitles at a natural boundary — never append "...".
 * Ellipsis mid-line reads cheap on a premium OG card.
 */
function trimBlogOgSubtitle(value: string, maxLength: number): string {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  for (const separator of [" — ", "—"]) {
    const dashIndex = trimmed.lastIndexOf(separator, maxLength);

    if (dashIndex >= maxLength * 0.45) {
      return trimmed.slice(0, dashIndex).trimEnd();
    }
  }

  let truncated = trimmed.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.55) {
    truncated = truncated.slice(0, lastSpace);
  }

  return truncated.trimEnd();
}

export function sanitizeBlogOgContent(content: BlogOgContent): BlogOgContent {
  return {
    quote: trimToMaxLength(content.quote, BLOG_OG_QUOTE_MAX_LENGTH),
    description: content.description
      ? trimBlogOgSubtitle(content.description, BLOG_OG_SUBTITLE_MAX_LENGTH)
      : undefined,
    forceSubtitle: content.forceSubtitle,
    author: trimToMaxLength(content.author, BLOG_OG_AUTHOR_MAX_LENGTH),
    handle: trimToMaxLength(content.handle, BLOG_OG_HANDLE_MAX_LENGTH),
    avatar: content.avatar,
  };
}

export function isValidBlogPostSlug(slug: string): boolean {
  return (
    slug.length > 0 && slug.length <= 120 && BLOG_POST_SLUG_PATTERN.test(slug)
  );
}
