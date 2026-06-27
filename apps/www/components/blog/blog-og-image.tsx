/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: onLoad tracks image readiness for the skeleton overlay. */
"use client";

import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  isValidElement,
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type LoadPhase = "loading" | "fading" | "revealed";

export interface BlogOgImageProps extends ComponentPropsWithoutRef<"div"> {
  /** Single Next.js `Image` or `img` element. */
  children: ReactElement;
  /**
   * Skeleton fade-out duration in seconds.
   * @default 0.45
   */
  fadeDuration?: number;
  /**
   * Minimum time to show the skeleton before fading out, in seconds.
   * @default 0
   */
  minDuration?: number;
  skeletonClassName?: string;
}

interface ImageChildProps {
  className?: string;
  onLoad?: (event: SyntheticEvent) => void;
}

function mergeImageReadyHandler(
  existing: ((event: SyntheticEvent) => void) | undefined,
  onReady: () => void
) {
  return (event: SyntheticEvent) => {
    existing?.(event);
    onReady();
  };
}

/** Skeleton overlay that crossfades to a loaded blog OG image. */
export function BlogOgImage({
  children,
  className,
  fadeDuration = 0.45,
  minDuration = 0,
  skeletonClassName,
  ...props
}: BlogOgImageProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaReadyRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
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

  const beginReveal = useCallback(() => {
    if (mediaReadyRef.current) {
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
  }, [fadeDuration, minDuration, prefersReducedMotion, schedule]);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  useEffect(() => {
    const image = containerRef.current?.querySelector("img");
    if (image?.complete && image.naturalWidth > 0) {
      beginReveal();
    }
  }, [beginReveal]);

  const child = Children.only(children);

  if (!isValidElement(child)) {
    throw new Error("BlogOgImage expects a single React element child.");
  }

  const childProps = child.props as ImageChildProps;

  const media = cloneElement(child, {
    className: childProps.className,
    onLoad: mergeImageReadyHandler(childProps.onLoad, beginReveal),
  } as ImageChildProps);

  const showSkeleton = phase !== "revealed";
  const showMedia = phase !== "loading";

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
        className="size-full"
        initial={false}
        transition={{
          duration: phase === "fading" ? fadeDuration : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {media}
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
                "size-full rounded-none bg-muted-foreground/15",
                skeletonClassName
              )}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
