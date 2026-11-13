"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import type * as React from "react";

const LIST_HEIGHT_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const LIST_HEIGHT_DURATION_MS = 200;

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "bg-background text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-xl",
        className
      )}
      {...props}
    />
  );
}

function CommandInput({
  className,
  suffix,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  suffix?: React.ReactNode;
}) {
  return (
    <div
      className="flex h-12 min-w-0 items-center gap-2 px-3 sm:h-14"
      data-slot="command-input-wrapper"
    >
      <Search
        aria-hidden
        className="size-4 shrink-0 opacity-50"
        strokeWidth={1.5}
      />
      <CommandPrimitive.Input
        className={cn(
          "placeholder:text-muted-foreground flex h-12 w-full min-w-0 flex-1 rounded-xl bg-transparent py-2.5 text-base outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:py-3",
          className
        )}
        data-slot="command-input"
        {...props}
      />
      {suffix}
    </div>
  );
}

function CommandList({
  className,
  ref,
  scrollLocked = false,
  style,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List> & {
  ref?: React.Ref<HTMLDivElement>;
  scrollLocked?: boolean;
}) {
  return (
    <CommandPrimitive.List
      className={cn(
        "scroll-py-1 [scrollbar-width:none] [overflow-anchor:none] [&::-webkit-scrollbar]:hidden",
        "max-h-[calc(85dvh-5.5rem)] sm:max-h-[min(350px,calc(70dvh-5.5rem))] md:max-h-[350px]",
        scrollLocked ? "overflow-hidden" : "overflow-x-hidden overflow-y-auto",
        className
      )}
      data-slot="command-list"
      ref={ref}
      style={{
        height: "var(--cmdk-list-height)",
        transition: `height ${LIST_HEIGHT_DURATION_MS}ms ${LIST_HEIGHT_EASING}`,
        ...style,
      }}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className="text-muted-foreground py-8 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden px-2 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      data-slot="command-group"
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md py-2.5 ps-2.5 pe-2.5 text-sm outline-hidden transition-colors duration-100 select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 sm:py-3 sm:ps-3 sm:pe-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="command-item"
      {...props}
    />
  );
}

function CommandGroupHighlight({
  className,
  containerClassName,
  children,
}: {
  className?: string;
  containerClassName?: string;
  /** Kept for backwards compatibility. */
  deferMeasure?: boolean;
  /** Kept for backwards compatibility. */
  values?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", containerClassName, className)}>
      {children}
    </div>
  );
}

function CommandHighlightItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandItem className={className} {...props} />;
}

export const COMMAND_LIST_HEIGHT_DURATION_MS = LIST_HEIGHT_DURATION_MS;

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupHighlight,
  CommandHighlightItem,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
};
