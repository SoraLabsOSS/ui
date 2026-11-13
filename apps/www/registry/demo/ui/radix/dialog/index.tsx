"use client";

import { useState } from "react";

import { Button } from "@/registry/ui/radix/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui/radix/dialog";

export default function RadixDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center p-4">
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button>Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                className="text-right text-sm font-medium"
                htmlFor="radix-profile-name"
              >
                Name
              </label>
              <input
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 col-span-3 h-9 rounded-md border px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-2"
                defaultValue="Alex Rivera"
                id="radix-profile-name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                className="text-right text-sm font-medium"
                htmlFor="radix-profile-username"
              >
                Username
              </label>
              <input
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 col-span-3 h-9 rounded-md border px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-2"
                defaultValue="@alexrivera"
                id="radix-profile-username"
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={() => setOpen(false)} type="button">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
