"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchStaticSearchIndex,
  resolveBookmarkPages,
} from "@/lib/bookmarks/resolve-pages";
import { useBookmarks } from "@/lib/bookmarks/use-bookmarks";

const STATIC_INDEX_STALE_TIME_MS = 10 * 60 * 1000;
const STATIC_INDEX_GC_TIME_MS = 30 * 60 * 1000;

export function useBookmarkPages() {
  const {
    bookmarks,
    isAuthenticated,
    isLoading: isBookmarksLoading,
    isToggling,
    removingUrl,
    sessionPending,
    toggleBookmark,
  } = useBookmarks();

  const staticQuery = useQuery({
    queryKey: ["static-search-index"],
    queryFn: fetchStaticSearchIndex,
    enabled: isAuthenticated,
    staleTime: STATIC_INDEX_STALE_TIME_MS,
    gcTime: STATIC_INDEX_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const pages = useMemo(
    () => resolveBookmarkPages(bookmarks, staticQuery.data),
    [bookmarks, staticQuery.data]
  );

  const isResolvingPages =
    isAuthenticated &&
    bookmarks.length > 0 &&
    staticQuery.isPending &&
    !staticQuery.data;

  const loading =
    sessionPending ||
    (isAuthenticated && isBookmarksLoading && bookmarks.length === 0) ||
    isResolvingPages;

  return {
    isAuthenticated,
    isRemoving: isToggling,
    loading,
    pages,
    removeBookmark: (url: string) => toggleBookmark(url, true),
    removingUrl,
    sessionPending,
  };
}
