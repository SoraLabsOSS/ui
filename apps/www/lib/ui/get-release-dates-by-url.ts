import {
  getPageReleaseDateString,
  type PageReleaseDateFields,
} from "@/lib/docs/get-page-release-date";
import { uiSource } from "@/lib/ui/source";

/** URL → date for the 10-day "new" sidebar badge on `/ui` pages. */
export function getUiReleaseDatesByUrl(): Record<string, string> {
  const map: Record<string, string> = {};

  for (const page of uiSource.getPages()) {
    const iso = getPageReleaseDateString(page.data as PageReleaseDateFields);
    if (iso) {
      map[page.url] = iso;
    }
  }

  return map;
}
