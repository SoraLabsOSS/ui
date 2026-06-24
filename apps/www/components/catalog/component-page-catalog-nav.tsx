"use client";

import {
  Sidebar001,
  Sidebar001Content,
  Sidebar001Item,
  Sidebar001Section,
} from "@workspace/ui/components/unlumen-ui/sidebar-001";
import { cn } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { isRecentlyReleased } from "@/lib/docs/is-recently-released";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { catalogDesktopSidebarScrollInsetClassName } from "./catalog-preview-classes";

interface ComponentPageCatalogNavProps {
  className?: string;
  items: ComponentGalleryItem[];
  onNavigate?: () => void;
}

function isCatalogItemActive(pathname: string, slug: string) {
  return pathname === `/components/${slug}`;
}

export function ComponentPageCatalogNav({
  className,
  items,
  onNavigate,
}: ComponentPageCatalogNavProps) {
  const pathname = usePathname();

  const sortedItems = useMemo(
    () => [...items].toSorted((a, b) => a.slug.localeCompare(b.slug)),
    [items]
  );

  const isAllComponentsActive = pathname === "/components";

  return (
    <Sidebar001
      className={cn("flex min-h-0 flex-1 flex-col bg-transparent", className)}
      defaultEffectsEnabled
      defaultWidth={320}
      maxWidth={320}
      minWidth={320}
    >
      <Sidebar001Content
        className={cn(
          "min-h-0 flex-1 px-3",
          catalogDesktopSidebarScrollInsetClassName
        )}
      >
        <Sidebar001Section>
          <Sidebar001Item
            href="/components"
            isActive={isAllComponentsActive}
            itemKey="all-components"
            label="All Components"
            onClick={onNavigate}
          />
          {sortedItems.map((item, index) => (
            <Sidebar001Item
              href={item.href}
              isActive={isCatalogItemActive(pathname, item.slug)}
              isNew={isRecentlyReleased(item.releaseDate)}
              itemKey={item.slug}
              key={item.slug}
              label={`${String(index + 1).padStart(2, "0")} ${item.title}`}
              onClick={onNavigate}
            />
          ))}
        </Sidebar001Section>
      </Sidebar001Content>
    </Sidebar001>
  );
}
