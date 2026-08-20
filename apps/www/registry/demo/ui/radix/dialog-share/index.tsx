"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/ui/radix/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui/radix/dialog";

export default function RadixDialogShareDemo() {
  const [copied, setCopied] = useState(false);

  const copyShareLink = () => {
    navigator.clipboard.writeText("https://sora-ui.com/ui/radix/dialog");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Share2 className="size-4" />
            Share Link
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            <div className="grid flex-1 gap-2">
              <label className="sr-only" htmlFor="radix-share-link-input">
                Link
              </label>
              <input
                className="h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 font-mono text-xs shadow-xs outline-none"
                id="radix-share-link-input"
                readOnly
                value="https://sora-ui.com/ui/radix/dialog"
              />
            </div>
            <Button
              onClick={copyShareLink}
              size="sm"
              type="button"
              variant="secondary"
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
