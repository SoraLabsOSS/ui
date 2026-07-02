import type { ReadTimeResults } from "reading-time";

/**
 * `readingTime` is attached to `vfile.data` by the `remark-reading-time`
 * plugin (see `source.config.ts`) and re-exported via `valueToExport`,
 * but fumadocs-mdx doesn't type arbitrary `valueToExport` fields.
 */
export function getReadingTimeMinutes(pageData: {
  readingTime: ReadTimeResults;
}): number {
  return Math.max(1, Math.round(pageData.readingTime.minutes));
}
