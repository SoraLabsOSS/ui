"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/ui/base/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui/base/dialog";

export default function DialogDestructiveDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center p-4">
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger
          render={
            <Button variant="destructive">
              <Trash2 className="size-4" />
              Delete Repository
            </Button>
          }
        />
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              repository and remove all associated collaborators.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
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
