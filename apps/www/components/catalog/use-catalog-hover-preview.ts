"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Grace period before actually hiding the preview after the pointer leaves
// an item. List rows have gaps between them, so the pointer is briefly over
// nothing while travelling from one row to the next — without this delay,
// the panel unmounts and remounts (fade out then snap back in) on every
// gap crossing, which reads as jank rather than a panel that chases the
// cursor smoothly.
const HOVER_LEAVE_GRACE_MS = 120;

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
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingLeave = useCallback(() => {
    if (leaveTimeoutRef.current !== null) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

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
    cancelPendingLeave();
    setHoverPreview(null);
    setHoverPosition(null);
  }, [cancelPendingLeave]);

  const scheduleClearHoverPreview = useCallback(() => {
    cancelPendingLeave();
    leaveTimeoutRef.current = setTimeout(() => {
      leaveTimeoutRef.current = null;
      setHoverPreview(null);
      setHoverPosition(null);
    }, HOVER_LEAVE_GRACE_MS);
  }, [cancelPendingLeave]);

  const onItemPointerEnter = useCallback(
    (item: ComponentGalleryItem, event: React.MouseEvent<HTMLElement>) => {
      cancelPendingLeave();

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
    [cancelPendingLeave, clearHoverPreview, previewBySlug]
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

  useEffect(() => cancelPendingLeave, [cancelPendingLeave]);

  return {
    clearHoverPreview,
    hoverPosition,
    hoverPreview,
    onItemPointerEnter,
    onItemPointerMove,
    onItemPointerLeave: scheduleClearHoverPreview,
  };
}
