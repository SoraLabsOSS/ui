import type { BookmarkRecord } from "@/lib/bookmarks/client";
import { normalizeBookmarkUrl } from "@/lib/bookmarks/validate-url";

const TRAILING_SLASH_REGEX = /\/$/;

export interface BookmarkPageData {
  description?: string;
  id: string;
  tag?: string;
  title: string;
  url: string;
}

export async function fetchStaticSearchIndex(): Promise<BookmarkPageData[]> {
  const response = await fetch("/static.json");

  if (!response.ok) {
    throw new Error("Failed to fetch search index");
  }

  return response.json() as Promise<BookmarkPageData[]>;
}

function fallbackPageFromUrl(url: string, id: string): BookmarkPageData {
  const normalizedUrl = normalizeBookmarkUrl(url);
  const segments = normalizedUrl
    .replace(TRAILING_SLASH_REGEX, "")
    .split("/")
    .filter(Boolean);
  const slug = segments.at(-1) ?? "page";
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id,
    url: normalizedUrl,
    title,
    tag: segments[0],
  };
}

export function resolveBookmarkPages(
  bookmarks: BookmarkRecord[] | undefined,
  index: BookmarkPageData[] | undefined
): BookmarkPageData[] {
  if (!bookmarks?.length) {
    return [];
  }

  const indexByUrl = new Map(index?.map((page) => [page.url, page]) ?? []);

  return bookmarks.map((bookmark) => {
    const normalizedUrl = normalizeBookmarkUrl(bookmark.url);
    const matched =
      indexByUrl.get(bookmark.url) ?? indexByUrl.get(normalizedUrl);
    if (matched) {
      return {
        ...matched,
        url: normalizedUrl,
      };
    }

    return fallbackPageFromUrl(bookmark.url, bookmark.id);
  });
}
