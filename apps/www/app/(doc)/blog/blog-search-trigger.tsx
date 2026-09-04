"use client";

import { useCommandPaletteOpen } from "@/components/command-palette/command-palette-trigger";

export function BlogSearchTrigger() {
  const openSearch = useCommandPaletteOpen();

  return (
    <div className="flex w-full max-w-xs items-center">
      <button
        aria-label="Search blog posts"
        className="group flex h-9 flex-1 cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 text-muted-foreground text-sm transition-colors duration-150 hover:border-foreground/30 hover:text-foreground"
        onClick={openSearch}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
          height="16"
          style={{ color: "currentColor" }}
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            clipRule="evenodd"
            d="M3.5 7a3.5 3.5 0 1 1 6.13 2.3l-.32.33A3.5 3.5 0 0 1 3.5 7m6.47 4.03a5 5 0 1 1 1.06-1.06l3 3 .53.53-1.06 1.06-.53-.53z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
        <span className="flex-1 truncate text-left transition-colors duration-150 group-hover:text-foreground">
          Search blog posts...
        </span>
        <kbd className="ml-0.5 inline-flex h-5 min-h-5 min-w-5 items-center justify-center rounded-sm bg-accent px-1 font-sans text-foreground text-xs leading-[1.7em] shadow-[0_0_0_1px_var(--border)] max-sm:hidden">
          <span>⌘ K</span>
        </kbd>
      </button>
    </div>
  );
}
