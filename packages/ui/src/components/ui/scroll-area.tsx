"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

interface ScrollAreaProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /**
   * Radix UI legacy scrollbar visibility mode (e.g. "auto" | "always" | "scroll" | "hover").
   * Accepted for backward compatibility.
   */
  type?: "auto" | "always" | "scroll" | "hover";
}

function ScrollArea({
  className,
  children,
  type: _legacyType,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative overflow-hidden", className)}
      data-slot="scroll-area"
      {...props}
    >
      {children}
      <ScrollBar orientation="vertical" />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollViewport({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>) {
  return (
    <ScrollAreaPrimitive.Viewport
      className={cn("size-full rounded-[inherit] outline-none", className)}
      data-radix-scroll-area-viewport=""
      data-slot="scroll-area-viewport"
      {...props}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        "group/scrollbar flex touch-none select-none transition-opacity duration-300 ease-out",
        // Auto-hide when idle (not hovering scroll area and not actively scrolling)
        "opacity-0 hover:opacity-100 data-hovering:opacity-100 data-scrolling:opacity-100",
        orientation === "vertical" && "h-full w-2.5 p-px",
        orientation === "horizontal" && "h-2.5 flex-col p-px",
        className
      )}
      data-radix-scroll-area-scrollbar=""
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className="relative flex-1 rounded-full bg-fd-border transition-colors hover:bg-muted-foreground/60"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

function ScrollCorner({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Corner>) {
  return (
    <ScrollAreaPrimitive.Corner
      className={cn("bg-transparent", className)}
      data-slot="scroll-area-corner"
      {...props}
    />
  );
}

export { ScrollArea, ScrollBar, ScrollCorner, ScrollViewport };
