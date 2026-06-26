import {
  getPageReleaseDateString,
  type PageReleaseDateFields,
} from "@/lib/docs/get-page-release-date";
import { source } from "@/lib/docs/source";

/**
 * URL → date used for the 10-day "new" sidebar badge.
 * Defaults to git lastModified per page; `releaseDate` in frontmatter overrides.
 */
export function getReleaseDatesByUrl(): Record<string, string> {
  const map: Record<string, string> = {};

  for (const page of source.getPages()) {
    const iso = getPageReleaseDateString(page.data as PageReleaseDateFields);
    if (iso) {
      map[page.url] = iso;
    }
  }

  return map;
}
