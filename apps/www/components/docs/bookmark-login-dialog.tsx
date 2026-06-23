"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@workspace/ui/components/animate-ui/primitives/radix/dialog";
import { X } from "lucide-react";
import Link from "next/link";
import {
  clearPendingBookmark,
  clearSigningInForBookmark,
  isSigningInForBookmark,
  markSigningInForBookmark,
} from "@/lib/bookmarks/pending-intent";

interface BookmarkLoginDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  redirectUrl: string;
}

export function BookmarkLoginDialog({
  open,
  onOpenChange,
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
    markSigningInForBookmark();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogContent
          className="fixed top-[50%] left-[50%] z-50 w-[calc(100vw-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-5 sm:p-6"
          from="left"
        >
          <DialogHeader>
            <DialogTitle className="text-lg">Sign in to bookmark</DialogTitle>
            <DialogDescription className="text-sm">
              Save this page to your collection and access it anytime from your
              bookmarks.
            </DialogDescription>
          </DialogHeader>

          <p className="py-4 text-muted-foreground text-sm">
            You need to be signed in to use bookmarks. Sign in to save this
            page, or cancel to keep browsing.
          </p>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <DialogClose
              className="rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
              onClick={handleCancel}
            >
              Cancel
            </DialogClose>
            <Link
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm transition-opacity hover:opacity-90"
              href={signInUrl}
              onClick={handleSignIn}
            >
              Sign in
            </Link>
          </DialogFooter>

          <DialogClose
            className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            onClick={handleCancel}
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
