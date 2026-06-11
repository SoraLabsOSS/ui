"use client";

import {
  ScrollArea,
  ScrollViewport,
} from "@workspace/ui/components/ui/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * Radix wraps viewport children in `display: table; min-width: 100%`, which can
 * force the docs column wider than its shell. Override on the inner wrapper.
 */
export const catalogScrollViewportClassName =
  "size-full min-w-0 overflow-x-hidden [&>div]:!block [&>div]:!min-w-0 [&>div]:w-full";

interface CatalogScrollAreaProps {
  children: ReactNode;
  className?: string;
  /** Hides the custom Radix thumb; OS scrollbar is already suppressed globally. */
  hideScrollbar?: boolean;
  viewportClassName?: string;
}

export function CatalogScrollArea({
  children,
  className,
  hideScrollbar = false,
  viewportClassName,
}: CatalogScrollAreaProps) {
  return (
    <ScrollArea
      className={cn(
        "min-h-0 min-w-0",
        hideScrollbar && "[&_[data-radix-scroll-area-scrollbar]]:hidden",
        className
      )}
      type="scroll"
    >
      <ScrollViewport
        className={cn(catalogScrollViewportClassName, viewportClassName)}
      >
        {children}
      </ScrollViewport>
    </ScrollArea>
  );
}
