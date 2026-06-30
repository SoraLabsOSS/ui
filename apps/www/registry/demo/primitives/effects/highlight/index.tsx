"use client";

import {
  Highlight,
  HighlightItem,
} from "@/registry/primitives/effects/highlight";

const ITEMS = ["Design", "Engineering", "Product", "Marketing", "Growth"];

export function HighlightDemo() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Highlight
        className="rounded-full bg-foreground/8"
        containerClassName="flex items-center"
        mode="parent"
        trigger="hover"
      >
        {ITEMS.map((item) => (
          <HighlightItem key={item} value={item}>
            <button
              className="relative z-10 cursor-pointer px-4 py-1.5 text-foreground/60 text-sm transition-colors hover:text-foreground"
              type="button"
            >
              {item}
            </button>
          </HighlightItem>
        ))}
      </Highlight>
    </div>
  );
}
