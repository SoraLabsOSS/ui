"use client";

import {
  Sidebar001,
  Sidebar001Content,
  Sidebar001Item,
  Sidebar001Section,
} from "@workspace/ui/components/unlumen-ui/sidebar-001";
import { cn } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isRecentlyReleased } from "@/lib/docs/is-recently-released";
import {
  getPreferredCardPreviewVideoSrc,
  resolveCardPreviewMedia,
  warmCardPreviewVideo,
} from "@/lib/registry/resolve-card-preview-media";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import {
  CatalogNavHoverPreview,
  type CatalogNavHoverPreviewState,
  getCatalogNavHoverPreviewPosition,
} from "./catalog-nav-hover-preview";
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
  const [hoverPreview, setHoverPreview] =
    useState<CatalogNavHoverPreviewState | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const sortedItems = useMemo(
    () => [...items].toSorted((a, b) => a.slug.localeCompare(b.slug)),
    [items]
  );

  const previewBySlug = useMemo(() => {
    const map = new Map<string, ReturnType<typeof resolveCardPreviewMedia>>();

    for (const item of sortedItems) {
      const media = resolveCardPreviewMedia(
        item.cardPreview,
        item.previewVideo
      );
      if (media) {
        map.set(item.slug, media);
      }
    }

    return map;
  }, [sortedItems]);

  const clearHoverPreview = useCallback(() => {
    setHoverPreview(null);
    setHoverPosition(null);
  }, []);

  const updateHoverPreview = useCallback(
    (
      item: ComponentGalleryItem,
      event: React.MouseEvent<HTMLAnchorElement>
    ) => {
      const media = previewBySlug.get(item.slug);
      if (!media) {
        clearHoverPreview();
        return;
      }

      const videoSrc = getPreferredCardPreviewVideoSrc(media);
      if (videoSrc) {
        warmCardPreviewVideo(videoSrc);
      }

      setHoverPosition(getCatalogNavHoverPreviewPosition(event));
      setHoverPreview({
        title: item.title,
        media,
        videoSrc,
      });
    },
    [clearHoverPreview, previewBySlug]
  );

  const updateHoverPosition = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      setHoverPosition(getCatalogNavHoverPreviewPosition(event));
    },
    []
  );

  // Reset flyout when navigating to another component page.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname drives intentional reset
  useEffect(() => {
    setHoverPreview(null);
    setHoverPosition(null);
  }, [pathname]);

  useEffect(() => {
    for (const item of sortedItems.slice(0, 5)) {
      const media = previewBySlug.get(item.slug);
      if (!media) {
        continue;
      }

      const videoSrc = getPreferredCardPreviewVideoSrc(media);
      if (videoSrc) {
        warmCardPreviewVideo(videoSrc);
      }
    }
  }, [previewBySlug, sortedItems]);

  const isAllComponentsActive = pathname === "/components";

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
              onItemPointerLeave={clearHoverPreview}
            />
            {sortedItems.map((item, index) => (
              <Sidebar001Item
                href={item.href}
                isActive={isCatalogItemActive(pathname, item.slug)}
                isNew={isRecentlyReleased(item.releaseDate)}
                itemKey={item.slug}
                key={item.slug}
                label={`${String(index + 1).padStart(2, "0")} ${item.title}`}
                onClick={() => {
                  clearHoverPreview();
                  onNavigate?.();
                }}
                onItemPointerEnter={(event) => {
                  updateHoverPreview(item, event);
                }}
                onItemPointerLeave={clearHoverPreview}
                onItemPointerMove={updateHoverPosition}
              />
            ))}
          </Sidebar001Section>
        </Sidebar001Content>
      </Sidebar001>

      <CatalogNavHoverPreview position={hoverPosition} preview={hoverPreview} />
    </>
  );
}
