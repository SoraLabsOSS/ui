"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, type Transition, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

const DEFAULT_TRANSITION: Transition = {
  repeat: Number.POSITIVE_INFINITY,
  duration: 5,
  ease: "linear",
};

/** Classic soft glow from motion-primitives Border Trail card examples. */
export const BORDER_TRAIL_DEFAULT_GLOW: CSSProperties = {
  boxShadow:
    "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
};

export interface BorderTrailProps {
  className?: string;
  /** When `false`, the trail is not rendered. */
  enabled?: boolean;
  /**
   * Corner radius for the motion path. Defaults to `size` (motion-primitives
   * behavior). Set explicitly to match the parent `border-radius` when needed.
   */
  radius?: number;
  /** Spotlight size in pixels — also drives path round when `radius` is omitted. */
  size?: number;
  style?: CSSProperties;
  transition?: Transition;
}

/** Animated border spotlight overlay — place inside a `relative` rounded container. */
export function BorderTrail({
  className,
  size = 60,
  radius,
  transition,
  style,
  enabled = true,
}: BorderTrailProps) {
  const prefersReducedMotion = useReducedMotion();
  const pathRadius = radius ?? size;

  if (!enabled) {
    return null;
  }

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-primary/25"
        data-slot="border-trail"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      data-slot="border-trail"
    >
      <motion.div
        animate={{ offsetDistance: ["0%", "100%"] }}
        className={cn("absolute aspect-square bg-zinc-500", className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${pathRadius}px)`,
          ...style,
        }}
        transition={transition ?? DEFAULT_TRANSITION}
      />
    </div>
  );
}
