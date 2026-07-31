import { cn } from "@workspace/ui/lib/utils";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import type * as React from "react";

const ScrollArea = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  ref?: React.RefObject<React.ComponentRef<
    typeof ScrollAreaPrimitive.Root
  > | null>;
}) => (
  <ScrollAreaPrimitive.Root
    className={cn("overflow-hidden", className)}
    ref={ref}
    {...props}
  >
    {children}
    <ScrollAreaPrimitive.Corner />
    <ScrollBar orientation="vertical" />
  </ScrollAreaPrimitive.Root>
);

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollViewport = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> & {
  ref?: React.RefObject<React.ComponentRef<
    typeof ScrollAreaPrimitive.Viewport
  > | null>;
}) => (
  <ScrollAreaPrimitive.Viewport
    className={cn("size-full rounded-[inherit]", className)}
    ref={ref}
    {...props}
  >
    {children}
  </ScrollAreaPrimitive.Viewport>
);

ScrollViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;

const ScrollBar = ({
  className,
  orientation = "vertical",
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar> & {
  ref?: React.RefObject<React.ComponentRef<
    typeof ScrollAreaPrimitive.Scrollbar
  > | null>;
}) => (
  <ScrollAreaPrimitive.Scrollbar
    className={cn(
      "flex select-none data-[state=hidden]:animate-fd-fade-out",
      orientation === "vertical" && "h-full w-1.5",
      orientation === "horizontal" && "h-1.5 flex-col",
      className
    )}
    orientation={orientation}
    ref={ref}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-fd-border" />
  </ScrollAreaPrimitive.Scrollbar>
);
ScrollBar.displayName = ScrollAreaPrimitive.Scrollbar.displayName;

export { ScrollArea, ScrollBar, ScrollViewport };
