"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useSearchContext } from "fumadocs-ui/provider";
import { CommandIcon } from "lucide-react";

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      className={cn(
        "flex h-8 w-48 items-center justify-between rounded-md bg-accent pr-1.5 pl-3 text-muted-foreground text-sm transition-colors duration-200 ease-in-out hover:bg-accent/70 lg:w-56 xl:w-64",
        className
      )}
      onClick={() => setOpenSearch(true)}
      type="button"
    >
      <span className="font-normal">Search...</span>

      <div className="flex items-center gap-1">
        <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background leading-none">
          <CommandIcon className="size-2.5" />
        </kbd>
        <kbd className="flex size-5 items-center justify-center rounded-[4px] border bg-background">
          <span className="pt-px text-[0.625rem] leading-none">K</span>
        </kbd>
      </div>
    </button>
  );
}
