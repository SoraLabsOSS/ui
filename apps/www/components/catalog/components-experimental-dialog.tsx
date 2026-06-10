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

interface ComponentsExperimentalDialogProps {
  onContinue: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ComponentsExperimentalDialog({
  open,
  onOpenChange,
  onContinue,
}: ComponentsExperimentalDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogContent
          className="fixed top-[50%] left-[50%] z-50 w-[calc(100vw-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-5 sm:p-6"
          from="left"
        >
          <DialogHeader>
            <DialogTitle className="text-lg">Experimental area</DialogTitle>
            <DialogDescription className="text-sm">
              The components gallery is still in preview and may change without
              notice.
            </DialogDescription>
          </DialogHeader>

          <p className="py-4 text-muted-foreground text-sm">
            For stable documentation and installation guides, use the docs. You
            can continue to explore this preview, or go back to docs.
          </p>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Link
              className="rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
              href="/docs"
            >
              Back to docs
            </Link>
            <DialogClose
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm transition-opacity hover:opacity-90"
              onClick={onContinue}
              type="button"
            >
              Continue anyway
            </DialogClose>
          </DialogFooter>

          <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
