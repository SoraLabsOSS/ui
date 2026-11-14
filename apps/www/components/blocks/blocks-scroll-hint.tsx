"use client";

import { cn } from "@workspace/ui/lib/utils";

export interface BlocksScrollHintProps {
  className?: string;
  label: string;
}

export function BlocksScrollHint({ label, className }: BlocksScrollHintProps) {
  return (
    <div
      className={cn(
        "my-20 grid content-start justify-items-center gap-6 text-center",
        className
      )}
    >
      <span className="after:to-foreground relative max-w-[12ch] text-xs leading-tight uppercase opacity-40 after:absolute after:top-full after:left-1/2 after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']">
        {label}
      </span>
    </div>
  );
}
