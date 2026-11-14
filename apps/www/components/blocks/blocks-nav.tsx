"use client";

import {
  Sidebar001,
  Sidebar001Content,
  Sidebar001Item,
  Sidebar001Section,
} from "@workspace/ui/components/sidebar-001";
import { cn } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

import { isRecentlyReleased } from "@/lib/docs/is-recently-released";
import type { ComponentGalleryItem } from "@/lib/registry/types";

import { BlocksNavHoverPreview } from "./blocks-nav-hover-preview";
import { blocksDesktopSidebarScrollInsetClassName } from "./blocks-preview-classes";
import { useBlocksHoverPreview } from "./use-blocks-hover-preview";

interface ComponentPageBlocksNavProps {
  className?: string;
  items: ComponentGalleryItem[];
  onNavigate?: () => void;
}

function isBlocksItemActive(pathname: string, slug: string) {
  return pathname === `/blocks/${slug}` || pathname === `/components/${slug}`;
}

export function ComponentPageBlocksNav({
  className,
  items,
  onNavigate,
}: ComponentPageBlocksNavProps) {
  const pathname = usePathname();
  const sortedItems = useMemo(
    () => [...items].toSorted((a, b) => a.slug.localeCompare(b.slug)),
    [items]
  );
  const {
    clearHoverPreview,
    hoverPosition,
    hoverPreview,
    onItemPointerEnter,
    onItemPointerLeave,
    onItemPointerMove,
  } = useBlocksHoverPreview(sortedItems);

  // Reset flyout when navigating to another component page.
  useEffect(() => {
    if (pathname) {
      clearHoverPreview();
    }
  }, [pathname, clearHoverPreview]);

  const isAllComponentsActive =
    pathname === "/blocks" || pathname === "/components";

  return (
    <>
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
            blocksDesktopSidebarScrollInsetClassName
          )}
        >
          <Sidebar001Section>
            <Sidebar001Item
              href="/blocks"
              isActive={isAllComponentsActive}
              itemKey="all-components"
              label="All Blocks"
              onClick={onNavigate}
              onItemPointerLeave={onItemPointerLeave}
            />
            {sortedItems.map((item, index) => (
              <Sidebar001Item
                href={item.href}
                isActive={isBlocksItemActive(pathname, item.slug)}
                isNew={isRecentlyReleased(item.releaseDate)}
                itemKey={item.slug}
                key={item.slug}
                label={`${String(index + 1).padStart(2, "0")} ${item.title}`}
                onClick={() => {
                  clearHoverPreview();
                  onNavigate?.();
                }}
                onItemPointerEnter={(event) => {
                  onItemPointerEnter(item, event);
                }}
                onItemPointerLeave={onItemPointerLeave}
                onItemPointerMove={onItemPointerMove}
              />
            ))}
          </Sidebar001Section>
        </Sidebar001Content>
      </Sidebar001>

      <BlocksNavHoverPreview position={hoverPosition} preview={hoverPreview} />
    </>
  );
}
