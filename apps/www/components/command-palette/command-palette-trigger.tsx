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
  const handlePreload = () => {
    import("./command-palette-dialog").catch(() => {});
  };

  if (variant === "icon") {
    return (
      <button
        aria-label="Open command palette"
        className={className}
        onClick={openCommandPalette}
        onFocus={handlePreload}
        onMouseEnter={handlePreload}
        type="button"
      >
        <CommandIcon />
      </button>
    );
  }

  return (
    <button
      className={cn(
        "bg-accent text-muted-foreground hover:bg-accent/70 flex h-8 w-48 items-center justify-between rounded-md pr-1.5 pl-3 text-sm transition-colors duration-200 ease-in-out lg:w-56 xl:w-64",
        className
      )}
      onClick={openCommandPalette}
      onFocus={handlePreload}
      onMouseEnter={handlePreload}
      type="button"
    >
      <span className="font-normal">Search...</span>

      <KbdGroup className="items-center gap-1">
        <Kbd className="bg-background flex size-5 items-center justify-center rounded-[4px] border leading-none">
          <CommandIcon className="size-2.5" />
        </Kbd>
        <Kbd className="bg-background flex size-5 items-center justify-center rounded-[4px] border px-0">
          <span className="pt-px text-[0.625rem] leading-none">K</span>
        </Kbd>
      </KbdGroup>
    </button>
  );
}
