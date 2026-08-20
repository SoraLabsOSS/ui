"use client";

import { useState } from "react";
import { Button } from "@/registry/ui/base/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui/base/dialog";

export default function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center p-4">
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger render={<Button>Edit Profile</Button>} />
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
            <Button onClick={() => setOpen(false)} type="button">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
