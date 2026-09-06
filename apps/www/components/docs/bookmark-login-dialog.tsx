"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import {
  clearPendingBookmark,
  clearSigningInForBookmark,
  isSigningInForBookmark,
  markSigningInForBookmark,
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
      <DialogContent
        className="max-w-md"
        containerClassName="z-[81]"
        overlayClassName="z-[80]"
      >
        <DialogHeader>
          <DialogTitle className="text-lg">Sign in to bookmark</DialogTitle>
          <DialogDescription className="text-sm">
            Save this page to your collection and access it anytime from your
            bookmarks.
          </DialogDescription>
        </DialogHeader>

        <p className="py-2 text-muted-foreground text-sm">
          You need to be signed in to use bookmarks. Sign in to save this page,
          or cancel to keep browsing.
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
