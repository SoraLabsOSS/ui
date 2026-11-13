"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { ComponentTocItem } from "@/lib/registry/types";

import { CatalogScrollArea } from "./catalog-scroll-area";

interface ComponentPageTocProps {
  className?: string;
  items: ComponentTocItem[];
}

export function ComponentPageToc({ items, className }: ComponentPageTocProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "sticky top-28 hidden flex-col gap-1 text-sm xl:flex",
        className
      )}
    >
      <p className="text-muted-foreground mb-2 shrink-0 text-[0.65rem] font-medium tracking-[0.2em] uppercase">
        On this page
      </p>
      <CatalogScrollArea className="max-h-[calc(100dvh-8rem)]">
        <ul className="border-border/60 flex flex-col gap-0.5 border-l pl-3">
          {items.map((item) => (
            <li key={item.url}>
              <a
                className="text-muted-foreground hover:text-foreground block py-1 transition-colors"
                href={item.url}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </CatalogScrollArea>
    </nav>
  );
}
