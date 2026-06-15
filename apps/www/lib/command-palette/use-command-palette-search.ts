"use client";

import { useDocsSearch } from "fumadocs-core/search/client";

const SEARCH_DELAY_MS = 150;

export function useCommandPaletteSearch() {
  return useDocsSearch({
    type: "fetch",
    api: "/api/search",
    delayMs: SEARCH_DELAY_MS,
  });
}

export function getSearchResults(
  data:
    | Array<{
        content: string;
        id: string;
        type: "heading" | "page" | "text";
        url: string;
      }>
    | "empty"
    | undefined
): Array<{
  content: string;
  id: string;
  type: "heading" | "page" | "text";
  url: string;
}> {
  if (!data || data === "empty") {
    return [];
  }

  return data;
}

export function matchesCommandQuery(
  searchValue: string,
  query: string
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return searchValue.toLowerCase().includes(normalized);
}
