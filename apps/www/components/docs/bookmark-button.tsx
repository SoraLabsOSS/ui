"use client";

import { cn } from "@workspace/ui/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type JSX, useCallback, useEffect, useState } from "react";
import { BookmarkLoginDialog } from "@/components/docs/bookmark-login-dialog";
import { setPendingBookmark } from "@/lib/bookmarks/pending-intent";
import { useBookmarks } from "@/lib/bookmarks/use-bookmarks";

import { normalizeBookmarkUrl } from "@/lib/bookmarks/validate-url";

const layoutTransition = {
  type: "spring",
  bounce: 0,
  duration: 0.3,
} as const;

export function BookmarkButton({
  url,
  transition = layoutTransition,
}: {
  url: string;
  transition?: React.ComponentProps<typeof motion.button>["transition"];
}): JSX.Element {
  const {
    bookmarks,
    isAuthenticated,
    resetToggleMutation,
    toggleBookmark,
    togglingUrl,
  } = useBookmarks();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [localPending, setLocalPending] = useState(false);

  const normalizedUrl = normalizeBookmarkUrl(url);
  const isBookmarked = bookmarks.some(
    (bookmark) => normalizeBookmarkUrl(bookmark.url) === normalizedUrl
  );
  const isBusy = localPending && togglingUrl === url;
  const showLoadingState = isBusy;

  useEffect(() => {
    if (!togglingUrl) {
      setLocalPending(false);
    }
  }, [togglingUrl]);

  useEffect(
    () => () => {
      setLocalPending(false);
      resetToggleMutation(url);
    },
    [resetToggleMutation, url]
  );

  const handleClick = useCallback(() => {
    if (isBusy) {
      return;
    }

    if (!isAuthenticated) {
      setPendingBookmark(url);
      setLoginDialogOpen(true);
      return;
    }

    setLocalPending(true);
    toggleBookmark(url, isBookmarked);
  }, [isAuthenticated, isBookmarked, isBusy, toggleBookmark, url]);

  return (
    <>
      <motion.button
        aria-busy={showLoadingState}
        className={cn(
          buttonVariants({
            color: "secondary",
            size: "sm",
            className:
              "shrink-0 select-none gap-2 overflow-hidden whitespace-nowrap border-0 [&_svg]:size-3.5",
          }),
          showLoadingState && "cursor-wait opacity-70"
        )}
        disabled={showLoadingState}
        layout
        onClick={handleClick}
        transition={transition}
        type="button"
      >
        <motion.span layout="position" transition={transition}>
          {showLoadingState ? (
            <Loader2 className="size-3.5 animate-spin text-fd-muted-foreground" />
          ) : (
            <Bookmark
              className={cn(
                "transition-all duration-300 ease-in-out [&_svg]:size-3.5",
                isBookmarked
                  ? "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400"
                  : "text-fd-muted-foreground"
              )}
            />
          )}
        </motion.span>
        <AnimatePresence initial={false} mode="popLayout">
          {showLoadingState ? null : (
            <motion.span
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              key={isBookmarked ? "saved" : "bookmark"}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {isBookmarked ? "Saved" : "Bookmark"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <BookmarkLoginDialog
        onOpenChange={setLoginDialogOpen}
        open={loginDialogOpen}
        redirectUrl={url}
      />
    </>
  );
}
