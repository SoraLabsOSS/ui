"use client";

import { AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/ui/base/alert-dialog";
import { Button } from "@/registry/ui/base/button";

export default function AlertDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center p-4">
      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogTrigger
          render={<Button variant="destructive">Delete Project</Button>}
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangleIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project repository, database records, and remove all associated
              API keys.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              closeOnClick
              onClick={() => setOpen(false)}
              variant="destructive"
            >
              Delete repository
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
