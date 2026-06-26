"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPreferredCardPreviewVideoSrc,
  resolveCardPreviewMedia,
  warmCardPreviewVideo,
} from "@/lib/registry/resolve-card-preview-media";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import {
  type CatalogNavHoverPreviewState,
  getCatalogNavHoverPreviewPosition,
} from "./catalog-nav-hover-preview";

export function useCatalogHoverPreview(
  items: ComponentGalleryItem[],
  { warmCount = 5 }: { warmCount?: number } = {}
) {
  const [hoverPreview, setHoverPreview] =
    useState<CatalogNavHoverPreviewState | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const previewBySlug = useMemo(() => {
    const map = new Map<string, ReturnType<typeof resolveCardPreviewMedia>>();

    for (const item of items) {
      const media = resolveCardPreviewMedia(
        item.cardPreview,
        item.previewVideo
      );
      if (media) {
        map.set(item.slug, media);
      }
    }

    return map;
  }, [items]);

  const clearHoverPreview = useCallback(() => {
    setHoverPreview(null);
    setHoverPosition(null);
  }, []);

  const onItemPointerEnter = useCallback(
    (item: ComponentGalleryItem, event: React.MouseEvent<HTMLElement>) => {
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

  const onItemPointerMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setHoverPosition(getCatalogNavHoverPreviewPosition(event));
    },
    []
  );

  useEffect(() => {
    for (const item of items.slice(0, warmCount)) {
      const media = previewBySlug.get(item.slug);
      if (!media) {
        continue;
      }

      const videoSrc = getPreferredCardPreviewVideoSrc(media);
      if (videoSrc) {
        warmCardPreviewVideo(videoSrc);
      }
    }
  }, [items, previewBySlug, warmCount]);

  return {
    clearHoverPreview,
    hoverPosition,
    hoverPreview,
    onItemPointerEnter,
    onItemPointerMove,
    onItemPointerLeave: clearHoverPreview,
  };
}
