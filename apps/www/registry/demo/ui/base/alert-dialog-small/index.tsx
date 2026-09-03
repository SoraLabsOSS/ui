"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/ui/base/alert-dialog";
import { Button } from "@/registry/ui/base/button";

export default function AlertDialogSmallDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center p-4">
      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogTrigger
          render={<Button variant="outline">Discard Changes</Button>}
        />
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved draft?</AlertDialogTitle>
            <AlertDialogDescription>
              All unsaved changes will be permanently discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              closeOnClick
              onClick={() => setOpen(false)}
              variant="destructive"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
