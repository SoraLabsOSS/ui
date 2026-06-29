"use client";

import { Kbd, KbdGroup } from "@workspace/ui/components/ui/kbd";
import { cn } from "@workspace/ui/lib/utils";
import { useSearchContext } from "fumadocs-ui/provider";
import { CommandIcon } from "lucide-react";
import { useCallback } from "react";

type CommandPaletteTriggerVariant = "search" | "icon";

interface CommandPaletteTriggerProps {
  className?: string;
  variant?: CommandPaletteTriggerVariant;
}

export function useCommandPaletteOpen() {
  const { setOpenSearch } = useSearchContext();

  return useCallback(() => {
    setOpenSearch(true);
  }, [setOpenSearch]);
}

export function CommandPaletteTrigger({
  className,
  variant = "search",
}: CommandPaletteTriggerProps) {
  const openCommandPalette = useCommandPaletteOpen();

  if (variant === "icon") {
    return (
      <button
        aria-label="Open command palette"
        className={className}
        onClick={openCommandPalette}
        type="button"
      >
        <CommandIcon />
      </button>
    );
  }

  return (
    <button
      className={cn(
        "flex h-8 w-48 items-center justify-between rounded-md bg-accent pr-1.5 pl-3 text-muted-foreground text-sm transition-colors duration-200 ease-in-out hover:bg-accent/70 lg:w-56 xl:w-64",
        className
      )}
      onClick={openCommandPalette}
      type="button"
    >
      <span className="font-normal">Search...</span>

      <KbdGroup className="items-center gap-1">
        <Kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background leading-none">
          <CommandIcon className="size-2.5" />
        </Kbd>
        <Kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background px-0">
          <span className="pt-px text-[0.625rem] leading-none">K</span>
        </Kbd>
      </KbdGroup>
    </button>
  );
}
