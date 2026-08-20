"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@workspace/auth-ui/lib/auth-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  type BookmarkRecord,
  BookmarkRequestError,
  createBookmark,
  fetchBookmarks,
  removeBookmark,
} from "@/lib/bookmarks/client";
import { bookmarkKeys } from "@/lib/bookmarks/keys";
import {
  claimPendingBookmarkForAutoSave,
  clearPendingBookmark,
  finishPendingBookmarkAutoSave,
} from "@/lib/bookmarks/pending-intent";
import { normalizeBookmarkUrl } from "@/lib/bookmarks/validate-url";

const BOOKMARKS_STALE_TIME_MS = 5 * 60 * 1000;
const BOOKMARKS_GC_TIME_MS = 30 * 60 * 1000;
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
  const { data: session, isPending: sessionPending } = useSession(authClient);
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const isAuthenticated = Boolean(userId);
  const listQueryKey = userId ? bookmarkKeys.list(userId) : bookmarkKeys.all;
  const previousUserIdRef = useRef<string | undefined>(userId);

  useEffect(() => {
    const previousUserId = previousUserIdRef.current;
    previousUserIdRef.current = userId;

    if (previousUserId && !userId) {
      queryClient.removeQueries({ queryKey: bookmarkKeys.all });
      clearPendingBookmark();
    }
  }, [queryClient, userId]);

  const query = useQuery({
    queryKey: listQueryKey,
    queryFn: fetchBookmarks,
    enabled: isAuthenticated,
    staleTime: BOOKMARKS_STALE_TIME_MS,
    gcTime: BOOKMARKS_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });

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
    onMutate: ({ url, isBookmarked }) => {
      queryClient.cancelQueries({ queryKey: listQueryKey });

      const previous = queryClient.getQueryData<BookmarkRecord[]>(listQueryKey);
      const canonicalUrl = normalizeBookmarkUrl(url);

      if (isBookmarked) {
        queryClient.setQueryData<BookmarkRecord[]>(listQueryKey, (old) =>
          (old ?? EMPTY_BOOKMARKS).filter(
            (bookmark) => normalizeBookmarkUrl(bookmark.url) !== canonicalUrl
          )
        );
      } else {
        queryClient.setQueryData<BookmarkRecord[]>(listQueryKey, (old) => {
          const bookmarks = old ?? EMPTY_BOOKMARKS;

          if (
            bookmarks.some(
              (bookmark) => normalizeBookmarkUrl(bookmark.url) === canonicalUrl
            )
          ) {
            return bookmarks;
          }

          return [
            {
              id: `optimistic-${canonicalUrl}`,
              url: canonicalUrl,
              createdAt: new Date().toISOString(),
            },
            ...bookmarks,
          ];
        });
      }

      return { previous };
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
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listQueryKey, context.previous);
      }

      toast.error(getBookmarkErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey });
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

  const resetToggleMutation = useCallback(
    (forUrl?: string) => {
      if (!toggleMutation.isPending) {
        return;
      }

      if (forUrl && toggleMutation.variables?.url !== forUrl) {
        return;
      }

      toggleMutation.reset();
    },
    [toggleMutation]
  );

  // Initial load only — not background revalidation when cached data exists.
  const isBookmarksLoading = isAuthenticated && query.isLoading;

  return {
    bookmarks: isAuthenticated
      ? (query.data ?? EMPTY_BOOKMARKS)
      : EMPTY_BOOKMARKS,
    isAuthenticated,
    isBookmarksLoading,
    isLoading: isBookmarksLoading,
    isToggling: toggleMutation.isPending,
    removingUrl,
    resetToggleMutation,
    sessionPending,
    toggleBookmark,
    togglingUrl,
  };
}
