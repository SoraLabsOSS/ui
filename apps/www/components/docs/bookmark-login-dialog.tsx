"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import {
  clearPendingBookmark,
  clearSigningInForBookmark,
  isSigningInForBookmark,
  markSigningInForBookmark,
  peekPendingBookmark,
} from "@/lib/bookmarks/pending-intent";
import { Button, buttonVariants } from "@/registry/ui/base/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/base/dialog";

interface BookmarkLoginDialogProps {
  containerClassName?: string;
  intent?: "account" | "bookmark";
  onOpenChange: (open: boolean) => void;
  open: boolean;
  overlayClassName?: string;
  redirectUrl: string;
}

export function BookmarkLoginDialog({
  containerClassName,
  intent = "bookmark",
  open,
  onOpenChange,
  overlayClassName,
  redirectUrl,
}: BookmarkLoginDialogProps) {
  const signInUrl = `/auth/sign-in?redirectTo=${encodeURIComponent(redirectUrl)}`;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (isSigningInForBookmark()) {
        clearSigningInForBookmark();
      } else {
        clearPendingBookmark();
      }
    }

    onOpenChange(nextOpen);
  };

  const handleCancel = () => {
    clearPendingBookmark();
  };

  const handleSignIn = () => {
    if (intent === "account") {
      clearPendingBookmark();
    } else if (peekPendingBookmark()) {
      markSigningInForBookmark();
    }
  };

  const isBookmarkIntent = intent === "bookmark";

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className="max-w-md gap-2"
        containerClassName={cn("z-[1001]", containerClassName)}
        overlayClassName={cn("z-[1000]", overlayClassName)}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isBookmarkIntent ? "Sign in to bookmark" : "Sign in to continue"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isBookmarkIntent
              ? "Save this page to your collection and access it anytime from your bookmarks."
              : "Sign in to access your account and saved pages."}
          </DialogDescription>
        </DialogHeader>

        {isBookmarkIntent && (
          <p className="text-muted-foreground text-sm">
            You need to be signed in to use bookmarks. Sign in to save this
            page, or cancel to keep browsing.
          </p>
        )}

        <DialogFooter className="flex flex-row justify-end gap-2">
          <DialogClose
            onClick={handleCancel}
            render={<Button variant="outline">Cancel</Button>}
          />
          <Link
            className={cn(buttonVariants({ variant: "default" }))}
            href={signInUrl}
            onClick={handleSignIn}
          >
            Sign in
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
