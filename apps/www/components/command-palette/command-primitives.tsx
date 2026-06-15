"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import type * as React from "react";

const LIST_HEIGHT_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const LIST_HEIGHT_DURATION_MS = 350;

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl bg-background text-popover-foreground",
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
          "flex h-12 w-full min-w-0 flex-1 rounded-xl bg-transparent py-2.5 text-base outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:py-3",
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
        "scroll-py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "max-h-[calc(85dvh-5.5rem)] sm:max-h-[min(350px,calc(70dvh-5.5rem))] md:max-h-[350px]",
        scrollLocked ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden",
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
      className="py-8 text-center text-muted-foreground text-sm"
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
        "overflow-hidden px-2 py-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs",
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
      className={cn("-mx-1 my-1 h-px bg-border", className)}
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
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-2.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 sm:px-3 sm:py-3 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="command-item"
      {...props}
    />
  );
}

export const COMMAND_LIST_HEIGHT_DURATION_MS = LIST_HEIGHT_DURATION_MS;

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
};
