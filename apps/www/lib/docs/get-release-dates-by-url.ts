import { blog } from "@/lib/blog/source";
import {
  getPageReleaseDateString,
  type PageReleaseDateFields,
} from "@/lib/docs/get-page-release-date";
import { source } from "@/lib/docs/source";
import { uiSource } from "@/lib/ui/source";

/**
 * URL → date used for the 10-day "new" sidebar badge.
 * Merges dates across all docs, ui, and blog pages so the sidebar
 * always has complete badge info regardless of the active section layout.
 * Defaults to git lastModified per page; `releaseDate` in frontmatter overrides.
 */
export function getReleaseDatesByUrl(): Record<string, string> {
  const map: Record<string, string> = {};

  const allPages = [
    ...source.getPages(),
    ...uiSource.getPages(),
    ...blog.getPages(),
  ];

  for (const page of allPages) {
    const iso = getPageReleaseDateString(page.data as PageReleaseDateFields);
    if (iso) {
      map[page.url] = iso;
    }
  }

  return map;
}
