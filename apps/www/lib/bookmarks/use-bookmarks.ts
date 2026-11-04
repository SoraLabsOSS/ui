"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@workspace/auth-ui/lib/auth-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  type BookmarkRecord,
  BookmarkRequestError,
  createBookmark,
  fetchBookmarks,
  removeBookmark,
} from "@/lib/bookmarks/client";
import {
  claimPendingBookmarkForAutoSave,
  clearPendingBookmark,
  finishPendingBookmarkAutoSave,
} from "@/lib/bookmarks/pending-intent";
import {
  fetchStaticSearchIndex,
  resolveBookmarkPages,
} from "@/lib/bookmarks/resolve-pages";
import { normalizeBookmarkUrl } from "@/lib/bookmarks/url";

export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  list: (userId: string) => [...bookmarkKeys.all, "list", userId] as const,
};

const BOOKMARKS_STALE_TIME_MS = 5 * 60 * 1000;
const BOOKMARKS_GC_TIME_MS = 30 * 60 * 1000;
const BOOKMARKS_SYNC_CHANNEL = "sora-bookmarks";
const EMPTY_BOOKMARKS: BookmarkRecord[] = [];

type ToggleBookmarkResult =
  | { action: "removed" }
  | { action: "created"; bookmark: BookmarkRecord }
  | { action: "conflict" };

function getBookmarkErrorMessage(error: unknown): string {
  if (error instanceof BookmarkRequestError) {
    if (error.status === 429) {
      return "Too many bookmark requests. Try again later.";
    }
    return error.message;
  }

  return "Could not update bookmark.";
}

export function useBookmarks() {
  const {
    data: session,
    isPending: sessionPending,
    refetch: refetchSession,
  } = useSession(authClient);
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const isAuthenticated = Boolean(userId);
  const listQueryKey = userId ? bookmarkKeys.list(userId) : bookmarkKeys.all;
  const previousUserIdRef = useRef<string | undefined>(userId);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const previousUserId = previousUserIdRef.current;
    previousUserIdRef.current = userId;

    if (previousUserId && !userId) {
      queryClient.removeQueries({ queryKey: bookmarkKeys.all });
      clearPendingBookmark();
    }
  }, [queryClient, userId]);

  useEffect(() => {
    if (!userId || typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(BOOKMARKS_SYNC_CHANNEL);
    syncChannelRef.current = channel;
    channel.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list(userId) });
    };

    return () => {
      syncChannelRef.current = null;
      channel.close();
    };
  }, [queryClient, userId]);

  const query = useQuery({
    queryKey: listQueryKey,
    queryFn: fetchBookmarks,
    enabled: isAuthenticated,
    staleTime: BOOKMARKS_STALE_TIME_MS,
    gcTime: BOOKMARKS_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) =>
      !(error instanceof BookmarkRequestError && error.status === 401) &&
      failureCount < 1,
  });

  useEffect(() => {
    if (
      query.error instanceof BookmarkRequestError &&
      query.error.status === 401
    ) {
      refetchSession();
    }
  }, [query.error, refetchSession]);

  const toggleMutation = useMutation({
    mutationFn: async ({
      url,
      isBookmarked,
    }: {
      url: string;
      isBookmarked: boolean;
    }): Promise<ToggleBookmarkResult> => {
      const canonicalUrl = normalizeBookmarkUrl(url);
      if (isBookmarked) {
        await removeBookmark(canonicalUrl);
        return { action: "removed" };
      }

      const bookmark = await createBookmark(canonicalUrl);
      if (!bookmark) {
        return { action: "conflict" };
      }

      return { action: "created", bookmark };
    },
    onMutate: async () => {
      // No optimistic write — the bookmark UI must not flip until the server confirms.
      await queryClient.cancelQueries({ queryKey: listQueryKey });
    },
    onSuccess: (result, { url }) => {
      const canonicalUrl = normalizeBookmarkUrl(url);
      if (result.action === "removed") {
        queryClient.setQueryData<BookmarkRecord[]>(listQueryKey, (old) =>
          (old ?? EMPTY_BOOKMARKS).filter(
            (item) => normalizeBookmarkUrl(item.url) !== canonicalUrl
          )
        );
        return;
      }

      if (result.action === "conflict") {
        // 409 — bookmark already exists; onSettled refetch syncs real data.
        return;
      }

      queryClient.setQueryData<BookmarkRecord[]>(listQueryKey, (old) => {
        const withoutUrl = (old ?? EMPTY_BOOKMARKS).filter(
          (item) => normalizeBookmarkUrl(item.url) !== canonicalUrl
        );

        return [result.bookmark, ...withoutUrl];
      });
    },
    onError: (error) => {
      toast.error(getBookmarkErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey });
      syncChannelRef.current?.postMessage("changed");
    },
  });

  const toggleBookmark = useCallback(
    (url: string, isBookmarked: boolean) => {
      toggleMutation.mutate({ url, isBookmarked });
    },
    [toggleMutation]
  );

  const { mutate: toggleMutate } = toggleMutation;

  useEffect(() => {
    if (sessionPending || !isAuthenticated || !query.isFetched) {
      return;
    }

    const pendingUrl = claimPendingBookmarkForAutoSave();
    if (!pendingUrl) {
      return;
    }

    const alreadyBookmarked = (query.data ?? EMPTY_BOOKMARKS).some(
      (bookmark) => bookmark.url === pendingUrl
    );

    if (alreadyBookmarked) {
      finishPendingBookmarkAutoSave(pendingUrl, true);
      return;
    }

    toggleMutate(
      { url: pendingUrl, isBookmarked: false },
      {
        onSettled: (_result, error) => {
          finishPendingBookmarkAutoSave(pendingUrl, !error);
        },
      }
    );
  }, [
    isAuthenticated,
    query.data,
    query.isFetched,
    sessionPending,
    toggleMutate,
  ]);

  const togglingUrl = toggleMutation.isPending
    ? (toggleMutation.variables?.url ?? null)
    : null;

  const removingUrl =
    toggleMutation.isPending && toggleMutation.variables?.isBookmarked
      ? toggleMutation.variables.url
      : null;

  // Initial load only — not background revalidation when cached data exists.
  const isBookmarksLoading = isAuthenticated && query.isLoading;

  return {
    bookmarks: isAuthenticated
      ? (query.data ?? EMPTY_BOOKMARKS)
      : EMPTY_BOOKMARKS,
    isAuthenticated,
    isBookmarksLoading,
    isLoading: isBookmarksLoading,
    error: query.data === undefined ? query.error : null,
    refetch: query.refetch,
    isToggling: toggleMutation.isPending,
    removingUrl,
    sessionPending,
    toggleBookmark,
    togglingUrl,
  };
}

const STATIC_INDEX_STALE_TIME_MS = 10 * 60 * 1000;
const STATIC_INDEX_GC_TIME_MS = 30 * 60 * 1000;

export function useBookmarkPages() {
  const {
    bookmarks,
    isAuthenticated,
    isBookmarksLoading,
    isToggling,
    error,
    refetch,
    removingUrl,
    sessionPending,
    toggleBookmark,
  } = useBookmarks();

  const staticQuery = useQuery({
    queryKey: ["static-search-index"],
    queryFn: fetchStaticSearchIndex,
    enabled: isAuthenticated && bookmarks.length > 0,
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
    error,
    isRemoving: isToggling,
    loading,
    pages,
    refetch,
    removeBookmark: (url: string) => toggleBookmark(url, true),
    removingUrl,
    sessionPending,
  };
}
