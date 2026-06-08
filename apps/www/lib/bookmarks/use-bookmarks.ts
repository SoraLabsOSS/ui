"use client";

import { useSession } from "@better-auth-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import {
  type BookmarkRecord,
  createBookmark,
  fetchBookmarks,
  removeBookmark,
} from "@/lib/bookmarks/client";
import { bookmarkKeys } from "@/lib/bookmarks/keys";

const BOOKMARKS_STALE_TIME_MS = 5 * 60 * 1000;
const BOOKMARKS_GC_TIME_MS = 30 * 60 * 1000;
const EMPTY_BOOKMARKS: BookmarkRecord[] = [];

export function useBookmarks() {
  const { data: session, isPending: sessionPending } = useSession(authClient);
  const queryClient = useQueryClient();
  const isAuthenticated = Boolean(session?.user);

  const query = useQuery({
    queryKey: bookmarkKeys.all,
    queryFn: fetchBookmarks,
    enabled: isAuthenticated,
    placeholderData: EMPTY_BOOKMARKS,
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
    }) => {
      const success = isBookmarked
        ? await removeBookmark(url)
        : await createBookmark(url);

      if (!success) {
        throw new Error("Bookmark update failed");
      }
    },
    onMutate: ({ url, isBookmarked }) => {
      queryClient.cancelQueries({ queryKey: bookmarkKeys.all });

      const previous = queryClient.getQueryData<BookmarkRecord[]>(
        bookmarkKeys.all
      );

      if (!isBookmarked) {
        queryClient.setQueryData<BookmarkRecord[]>(bookmarkKeys.all, (old) => {
          const bookmarks = old ?? EMPTY_BOOKMARKS;

          if (bookmarks.some((bookmark) => bookmark.url === url)) {
            return bookmarks;
          }

          return [
            {
              id: `optimistic-${url}`,
              url,
              createdAt: new Date().toISOString(),
            },
            ...bookmarks,
          ];
        });
      }

      return { previous };
    },
    onSuccess: (_data, { url, isBookmarked }) => {
      if (isBookmarked) {
        queryClient.setQueryData<BookmarkRecord[]>(bookmarkKeys.all, (old) =>
          (old ?? EMPTY_BOOKMARKS).filter((bookmark) => bookmark.url !== url)
        );
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bookmarkKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    },
  });

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

  const toggleBookmark = useCallback(
    (url: string, isBookmarked: boolean) => {
      toggleMutation.mutate({ url, isBookmarked });
    },
    [toggleMutation]
  );

  return {
    bookmarks: query.data ?? EMPTY_BOOKMARKS,
    isAuthenticated,
    isLoading: isAuthenticated && query.isFetching && query.isPlaceholderData,
    isToggling: toggleMutation.isPending,
    removingUrl,
    resetToggleMutation,
    sessionPending,
    toggleBookmark,
    togglingUrl,
  };
}
