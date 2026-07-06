"use client";

import {
  Highlight,
  HighlightItem,
} from "@/registry/primitives/effects/highlight";

const ITEMS = ["Design", "Engineering", "Product", "Marketing", "Growth"];
const MOBILE_ITEMS = ITEMS.slice(0, 3);

const HIGHLIGHT_PROPS = {
  className: "rounded-full bg-foreground/8",
  containerClassName: "flex items-center",
  mode: "parent" as const,
  trigger: "hover" as const,
};

function ItemList({ items }: { items: string[] }) {
  return (
    <Highlight {...HIGHLIGHT_PROPS}>
      {items.map((item) => (
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
  );
}

export function HighlightDemo() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <div className="sm:hidden">
        <ItemList items={MOBILE_ITEMS} />
      </div>
      <div className="hidden sm:block">
        <ItemList items={ITEMS} />
      </div>
    </div>
  );
}
