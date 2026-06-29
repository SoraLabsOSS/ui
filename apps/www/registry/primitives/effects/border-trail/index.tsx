"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, type Transition, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef } from "react";

export interface BorderTrailProps {
  className?: string;
  onAnimationComplete?: () => void;
  size?: number;
  style?: CSSProperties;
  transition?: Transition;
}

const DEFAULT_TRANSITION: Transition = {
  repeat: Number.POSITIVE_INFINITY,
  duration: 5,
  ease: "linear",
};

function getReducedMotionCompletionMs(
  duration: number,
  delay: number,
  repeat: number | undefined,
  repeatDelay: number
): number | null {
  if (
    repeat === Number.POSITIVE_INFINITY ||
    repeat === Number.NEGATIVE_INFINITY
  ) {
    return null;
  }

  // Motion: repeat N = initial play + N additional iterations.
  const iterationCount =
    typeof repeat === "number" && repeat > 0 ? repeat + 1 : 1;
  const betweenRepeatDelays =
    typeof repeat === "number" && repeat > 0 ? repeat * repeatDelay : 0;

  return (delay + duration * iterationCount + betweenRepeatDelays) * 1000;
}

export function BorderTrail({
  className,
  size = 60,
  transition,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const prefersReducedMotion = useReducedMotion();
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  onAnimationCompleteRef.current = onAnimationComplete;

  const resolvedTransition = { ...DEFAULT_TRANSITION, ...transition };
  const duration =
    typeof resolvedTransition.duration === "number"
      ? resolvedTransition.duration
      : 5;
  const delay =
    typeof resolvedTransition.delay === "number" ? resolvedTransition.delay : 0;
  const repeat = resolvedTransition.repeat;
  const repeatDelay =
    typeof resolvedTransition.repeatDelay === "number"
      ? resolvedTransition.repeatDelay
      : 0;

  useEffect(() => {
    if (!prefersReducedMotion) {
      return;
    }

    const completionMs = getReducedMotionCompletionMs(
      duration,
      delay,
      repeat,
      repeatDelay
    );
    if (completionMs === null) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => onAnimationCompleteRef.current?.(),
      completionMs
    );
    return () => window.clearTimeout(timeoutId);
  }, [prefersReducedMotion, duration, delay, repeat, repeatDelay]);

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-primary/25",
          className
        )}
        data-slot="border-trail"
        style={style}
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
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        className={cn("absolute aspect-square bg-zinc-500", className)}
        onAnimationComplete={onAnimationComplete}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        transition={resolvedTransition}
      />
    </div>
  );
}
