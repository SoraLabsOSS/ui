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
  intent?: "account" | "bookmark";
  onOpenChange: (open: boolean) => void;
  open: boolean;
  redirectUrl: string;
}

export function BookmarkLoginDialog({
  intent = "bookmark",
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
        className="max-w-md"
        containerClassName="z-[81]"
        overlayClassName="z-[80]"
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

        <p className="py-2 text-muted-foreground text-sm">
          {isBookmarkIntent
            ? "You need to be signed in to use bookmarks. Sign in to save this page, or cancel to keep browsing."
            : "You need to be signed in to continue."}
        </p>

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
