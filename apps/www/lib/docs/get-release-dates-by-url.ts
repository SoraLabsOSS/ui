import { source } from "@/lib/docs/source";

function toDateString(value: Date | string | number): string | undefined {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return;
  }
  return date.toISOString().slice(0, 10);
}

interface DocsPageData {
  /** From Fumadocs `lastModifiedTime: "git"` in source.config.ts */
  lastModified?: Date | string | number;
  /** Optional override when git lastModified is not what you want for the "new" badge. */
  releaseDate?: Date | string;
}

/**
 * URL → date used for the 30-day "new" sidebar badge.
 * Defaults to git lastModified per page; `releaseDate` in frontmatter overrides.
 */
export function getReleaseDatesByUrl(): Record<string, string> {
  const map: Record<string, string> = {};

  for (const page of source.getPages()) {
    const data = page.data as DocsPageData;
    const raw = data.releaseDate ?? data.lastModified;
    if (!raw) {
      continue;
    }
    const iso = toDateString(raw);
    if (iso) {
      map[page.url] = iso;
    }
  }

  return map;
}
