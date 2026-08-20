"use client";

import { Trash2 } from "lucide-react";
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

export default function RadixDialogDestructiveDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center p-4">
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="size-4" />
            Delete Repository
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              repository and remove all associated collaborators.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="destructive"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
