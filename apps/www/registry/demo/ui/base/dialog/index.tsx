"use client";

import { useState } from "react";
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

export default function DialogDemo() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4">
      {/* 1. Edit Profile Dialog */}
      <Dialog onOpenChange={setProfileOpen} open={profileOpen}>
        <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Edit Profile
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile information here. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                className="text-right font-medium text-sm"
                htmlFor="profile-name"
              >
                Name
              </label>
              <input
                className="col-span-3 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                defaultValue="Alex Rivera"
                id="profile-name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                className="text-right font-medium text-sm"
                htmlFor="profile-username"
              >
                Username
              </label>
              <input
                className="col-span-3 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                defaultValue="@alexrivera"
                id="profile-username"
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <button
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setProfileOpen(false)}
              type="button"
            >
              Save changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Destructive Alert Dialog */}
      <Dialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Delete Project
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              project repository and remove all deployed services.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-muted">
              Cancel
            </DialogClose>
            <button
              className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 py-2 font-medium text-destructive-foreground text-sm shadow-xs transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setDeleteOpen(false)}
              type="button"
            >
              Confirm Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
