/** Show a one-line hook when the headline alone would leave the OG card sparse. */
export const BLOG_OG_SUBTITLE_TITLE_THRESHOLD = 50;

/**
 * Resolve the optional subtitle line for blog OG images.
 * Short titles get a one-line hook; long titles stay headline-only.
 */
export function resolveBlogOgSubtitle(
  title: string,
  description: string | undefined,
  forceSubtitle = false
): string | undefined {
  if (!description?.trim()) {
    return;
  }

  if (
    !forceSubtitle &&
    title.trim().length >= BLOG_OG_SUBTITLE_TITLE_THRESHOLD
  ) {
    return;
  }

  return description;
}
