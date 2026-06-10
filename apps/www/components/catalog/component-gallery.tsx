import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import type { ComponentGalleryItem } from "@/lib/registry/types";

interface ComponentGalleryProps {
  className?: string;
  items: ComponentGalleryItem[];
}

export function ComponentGallery({ items, className }: ComponentGalleryProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((item) => (
        <Link
          className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-5 transition-colors hover:border-primary/40 hover:bg-muted/35"
          href={item.href}
          key={item.slug}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.18em]">
                {item.collection}
              </p>
              <h2 className="font-medium text-lg tracking-tight transition-colors group-hover:text-primary">
                {item.title}
              </h2>
            </div>
            {item.releaseDate ? (
              <time
                className="shrink-0 text-[0.65rem] text-muted-foreground"
                dateTime={item.releaseDate}
              >
                {item.releaseDate}
              </time>
            ) : null}
          </div>
          <p className="text-foreground/55 text-sm leading-relaxed">
            {item.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
