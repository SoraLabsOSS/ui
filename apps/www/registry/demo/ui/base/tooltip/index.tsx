"use client";

import { BookmarkIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/ui/base/button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/ui/base/tooltip";

export default function TooltipDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-48 items-center justify-center p-8">
      <TooltipProvider delay={100}>
        <Tooltip onOpenChange={setOpen} open={open}>
          <TooltipTrigger
            render={
              <Button size="icon" variant="outline">
                <BookmarkIcon className="size-4" />
                <span className="sr-only">Add to library</span>
              </Button>
            }
          />
          <TooltipContent side="top">
            Add to library
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
