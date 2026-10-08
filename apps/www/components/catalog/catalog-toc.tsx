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
      <p className="mb-2 shrink-0 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
        On this page
      </p>
      <CatalogScrollArea className="max-h-[calc(100dvh-8rem)]">
        <ul className="flex flex-col gap-0.5 border-border/60 border-l pl-3">
          {items.map((item) => (
            <li key={item.url}>
              <a
                className="block py-1 text-muted-foreground transition-colors hover:text-foreground"
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
