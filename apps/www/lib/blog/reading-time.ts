import type { ReadTimeResults } from "reading-time";

/**
 * `readingTime` is attached to `vfile.data` by the `remark-reading-time`
 * plugin (see `source.config.ts`) and re-exported via `valueToExport` +
 * the `doc.passthroughs` plugin — an internal, undocumented fumadocs-mdx
 * mechanism. If that ever breaks (e.g. a fumadocs-mdx upgrade), degrade to
 * hiding the "min read" badge instead of crashing the whole blog post page.
 */
export function getReadingTimeMinutes(pageData: unknown): number | null {
  const readingTime = (pageData as { readingTime?: ReadTimeResults })
    ?.readingTime;

  if (typeof readingTime?.minutes !== "number") {
    return null;
  }

  return Math.max(1, Math.round(readingTime.minutes));
}
