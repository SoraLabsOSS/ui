"use client";

import {
  ScrollArea,
  ScrollViewport,
} from "@workspace/ui/components/ui/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface CatalogScrollAreaProps {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
}

export function CatalogScrollArea({
  children,
  className,
  viewportClassName,
}: CatalogScrollAreaProps) {
  return (
    <ScrollArea className={cn("min-h-0", className)} type="scroll">
      <ScrollViewport className={cn("size-full", viewportClassName)}>
        {children}
      </ScrollViewport>
    </ScrollArea>
  );
}
