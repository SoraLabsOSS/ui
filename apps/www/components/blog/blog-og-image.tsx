/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: onLoad tracks image readiness for the skeleton overlay. */
"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image, { type ImageProps } from "next/image";
import {
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Skeleton } from "@/registry/primitives/effects/skeleton";

type LoadPhase = "loading" | "fading" | "revealed";

export interface BlogOgImageProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Skeleton fade-out duration in seconds.
   * @default 0.45
   */
  fadeDuration?: number;
  /** Next.js Image props (rendered inside the client boundary). */
  image: ImageProps;
  /**
   * Minimum time to show the skeleton before fading out, in seconds.
   * @default 0
   */
  minDuration?: number;
  /** Called when the image fails to load. Skeleton stays visible. */
  onMediaError?: () => void;
  skeletonClassName?: string;
}

function mergeImageReadyHandler(
  existing: ImageProps["onLoad"],
  onReady: () => void
) {
  return (event: SyntheticEvent<HTMLImageElement>) => {
    existing?.(event);
    onReady();
  };
}

function mergeImageErrorHandler(
  existing: ImageProps["onError"],
  onError: () => void
) {
  return (event: SyntheticEvent<HTMLImageElement>) => {
    existing?.(event);
    onError();
  };
}

/** Skeleton overlay that crossfades to a loaded blog OG image. */
export function BlogOgImage({
  image,
  className,
  fadeDuration = 0.45,
  minDuration = 0,
  onMediaError,
  skeletonClassName,
  ...props
}: BlogOgImageProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaReadyRef = useRef(false);
  const startedAtRef = useRef(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [phase, setPhase] = useState<LoadPhase>("loading");

  const clearTimeouts = useCallback(() => {
    for (const id of timeoutIdsRef.current) {
      clearTimeout(id);
    }

    timeoutIdsRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const id = setTimeout(callback, delayMs);
    timeoutIdsRef.current.push(id);
  }, []);

  const handleMediaError = useCallback(() => {
    clearTimeouts();
    setLoadFailed(true);
    onMediaError?.();
  }, [clearTimeouts, onMediaError]);

  const beginReveal = useCallback(() => {
    if (mediaReadyRef.current || loadFailed) {
      return;
    }

    mediaReadyRef.current = true;

    if (prefersReducedMotion) {
      setPhase("revealed");
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const minMs = Math.max(0, minDuration) * 1000;
    const waitMs = Math.max(0, minMs - elapsed);

    schedule(() => {
      setPhase("fading");
      schedule(() => setPhase("revealed"), fadeDuration * 1000);
    }, waitMs);
  }, [fadeDuration, loadFailed, minDuration, prefersReducedMotion, schedule]);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  const { onError, onLoad, src, ...imageProps } = image;

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    const img = containerRef.current?.querySelector("img");
    if (img?.complete && img.naturalWidth > 0) {
      beginReveal();
    }
  }, [beginReveal]);

  const showSkeleton = loadFailed || phase !== "revealed";
  const showMedia = !loadFailed && phase !== "loading";

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      data-slot="blog-og-image"
      ref={containerRef}
      {...props}
    >
      <motion.div
        animate={{ opacity: showMedia ? 1 : 0 }}
        aria-busy={showSkeleton}
        className="relative size-full"
        initial={false}
        transition={{
          duration: phase === "fading" ? fadeDuration : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {loadFailed ? null : (
          <Image
            {...imageProps}
            onError={mergeImageErrorHandler(onError, handleMediaError)}
            onLoad={mergeImageReadyHandler(onLoad, beginReveal)}
            src={src}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {showSkeleton ? (
          <motion.div
            animate={{ opacity: phase === "fading" ? 0 : 1 }}
            aria-hidden
            className="absolute inset-0 z-10"
            exit={{ opacity: 0 }}
            initial={false}
            key="blog-og-skeleton"
            transition={{
              duration: fadeDuration,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Skeleton
              className={cn(
                "size-full bg-muted-foreground/15",
                skeletonClassName
              )}
              rounded="none"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
