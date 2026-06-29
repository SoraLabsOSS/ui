"use client";

import { cn } from "@workspace/ui/lib/utils";

export interface CatalogScrollHintProps {
  className?: string;
  label: string;
}

export function CatalogScrollHint({
  label,
  className,
}: CatalogScrollHintProps) {
  return (
    <div
      className={cn(
        "my-20 grid content-start justify-items-center gap-6 text-center",
        className
      )}
    >
      <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:top-full after:left-1/2 after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:to-foreground after:content-['']">
        {label}
      </span>
    </div>
  );
}
