"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ResolvedCardPreviewMedia } from "@/lib/registry/resolve-card-preview-media";

const PREVIEW_WIDTH = 224;
const PREVIEW_HEIGHT = 170;
const PREVIEW_OFFSET = 18;

const PREVIEW_SPRING = {
  stiffness: 260,
  damping: 28,
  mass: 0.65,
} as const;

export interface CatalogNavHoverPreviewState {
  media: ResolvedCardPreviewMedia;
  title: string;
  videoSrc: string | null;
}

export function getCatalogNavHoverPreviewPosition(
  event: React.MouseEvent<HTMLElement>
) {
  const maxX = Math.max(16, window.innerWidth - PREVIEW_WIDTH - 16);
  const maxY = Math.max(16, window.innerHeight - PREVIEW_HEIGHT - 16);
  const x = Math.max(16, Math.min(event.clientX + PREVIEW_OFFSET, maxX));
  const y = Math.max(16, Math.min(event.clientY + PREVIEW_OFFSET, maxY));

  return { x, y };
}

function getPreviewKey(preview: CatalogNavHoverPreviewState) {
  return preview.videoSrc ?? preview.media.poster ?? preview.title;
}

function useCanHoverPreview() {
  const [canHoverPreview, setCanHoverPreview] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      setCanHoverPreview(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return canHoverPreview;
}

function CatalogNavPreviewMedia({
  media,
  videoSrc,
}: {
  media: ResolvedCardPreviewMedia;
  videoSrc: string | null;
}) {
  const [isVideoReady, setIsVideoReady] = useState(false);

  return (
    <div className="relative h-32 w-full bg-muted">
      {media.poster ? (
        <Image
          alt=""
          aria-hidden
          className={cn(
            "object-cover transition-opacity duration-150",
            videoSrc && isVideoReady ? "opacity-0" : "opacity-100"
          )}
          fill
          sizes="224px"
          src={media.poster}
        />
      ) : null}
      {videoSrc ? (
        <video
          autoPlay
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-150",
            isVideoReady ? "opacity-100" : "opacity-0"
          )}
          key={videoSrc}
          loop
          muted
          onLoadedData={() => {
            setIsVideoReady(true);
          }}
          playsInline
          preload="auto"
          src={videoSrc}
        />
      ) : null}
    </div>
  );
}

function useSmoothPreviewPosition(
  position: { x: number; y: number } | null,
  previewKey: string | null
) {
  const prefersReducedMotion = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, PREVIEW_SPRING);
  const y = useSpring(targetY, PREVIEW_SPRING);
  const activePreviewKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!position) {
      activePreviewKeyRef.current = null;
      return;
    }

    const isNewPreview = previewKey !== activePreviewKeyRef.current;
    activePreviewKeyRef.current = previewKey;

    if (prefersReducedMotion || isNewPreview) {
      targetX.jump(position.x);
      targetY.jump(position.y);
      return;
    }

    targetX.set(position.x);
    targetY.set(position.y);
  }, [position, previewKey, prefersReducedMotion, targetX, targetY]);

  return { x, y };
}

interface CatalogNavHoverPreviewProps {
  position: { x: number; y: number } | null;
  preview: CatalogNavHoverPreviewState | null;
}

export function CatalogNavHoverPreview({
  position,
  preview,
}: CatalogNavHoverPreviewProps) {
  const canHoverPreview = useCanHoverPreview();
  const [mounted, setMounted] = useState(false);
  const previewKey = preview ? getPreviewKey(preview) : null;
  const { x, y } = useSmoothPreviewPosition(position, previewKey);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!(mounted && canHoverPreview)) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {preview && position ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none fixed top-0 left-0 z-80 w-56"
          exit={{ opacity: 0, scale: 0.98 }}
          initial={{ opacity: 0, scale: 0.98 }}
          key={previewKey}
          style={{ x, y }}
          transition={{ duration: 0.08, ease: "easeOut" }}
        >
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-md">
            <CatalogNavPreviewMedia
              key={previewKey}
              media={preview.media}
              videoSrc={preview.videoSrc}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
