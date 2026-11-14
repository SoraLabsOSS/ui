"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";

export function BlocksPreviewLoadingOverlay({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-secondary/80 text-muted-foreground absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm backdrop-blur-sm max-lg:rounded-3xl lg:rounded-none lg:rounded-b-2xl",
        className
      )}
    >
      <Loader className="size-4 animate-spin" />
      Loading preview...
    </div>
  );
}
