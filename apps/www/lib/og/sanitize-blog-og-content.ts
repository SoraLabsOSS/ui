import type { BlogOgContent } from "@/lib/og/blog-og-types";

export const BLOG_OG_QUOTE_MAX_LENGTH = 200;
export const BLOG_OG_DESCRIPTION_MAX_LENGTH = 160;
export const BLOG_OG_AUTHOR_MAX_LENGTH = 80;
export const BLOG_OG_HANDLE_MAX_LENGTH = 64;

export const BLOG_POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function trimToMaxLength(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function trimToMaxLengthWithEllipsis(value: string, maxLength: number): string {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const ellipsis = "...";
  const sliceLength = maxLength - ellipsis.length;

  if (sliceLength <= 0) {
    return ellipsis;
  }

  let truncated = trimmed.slice(0, sliceLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > sliceLength * 0.6) {
    truncated = truncated.slice(0, lastSpace);
  }

  return `${truncated.trimEnd()}${ellipsis}`;
}

export function sanitizeBlogOgContent(content: BlogOgContent): BlogOgContent {
  return {
    quote: trimToMaxLength(content.quote, BLOG_OG_QUOTE_MAX_LENGTH),
    description: content.description
      ? trimToMaxLengthWithEllipsis(
          content.description,
          BLOG_OG_DESCRIPTION_MAX_LENGTH
        )
      : undefined,
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
