"use client";

import { useCommandPaletteOpen } from "@/components/command-palette/command-palette-trigger";

export function BlogSearchTrigger() {
  const openSearch = useCommandPaletteOpen();

  return (
    <div className="flex w-full max-w-xs items-center">
      <button
        aria-label="Search blog posts"
        className="group border-border/80 bg-background/80 text-muted-foreground hover:border-foreground/30 hover:text-foreground flex h-9 flex-1 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm transition-colors duration-150"
        onClick={openSearch}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors duration-150"
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
        <span className="group-hover:text-foreground flex-1 truncate text-left transition-colors duration-150">
          Search blog posts...
        </span>
        <kbd className="bg-accent text-foreground ml-0.5 inline-flex h-5 min-h-5 min-w-5 items-center justify-center rounded-sm px-1 font-sans text-xs leading-[1.7em] shadow-[0_0_0_1px_var(--border)] max-sm:hidden">
          <span>⌘ K</span>
        </kbd>
      </button>
    </div>
  );
}
