"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  BORDER_TRAIL_DEFAULT_GLOW,
  BorderTrail,
  type BorderTrailProps,
} from "@/registry/primitives/effects/border-trail";

export interface BorderTrailDemoProps extends BorderTrailProps {
  containerClassName?: string;
  duration?: number;
  glow?: boolean;
}

/** Docs preview — card with animated border trail. */
/** Matches Tailwind `rounded-xl` (0.75rem). */
const ROUNDED_XL_RADIUS = 12;

export function BorderTrailDemo({
  containerClassName,
  duration = 5,
  enabled = true,
  glow = true,
  radius = ROUNDED_XL_RADIUS,
  size = 100,
  style,
  transition,
}: BorderTrailDemoProps) {
  const resolvedTransition = transition ?? {
    repeat: Number.POSITIVE_INFINITY,
    duration,
    ease: "linear" as const,
  };

  const resolvedStyle = glow
    ? { ...BORDER_TRAIL_DEFAULT_GLOW, ...style }
    : style;

  return (
    <div className="flex items-center justify-center p-6">
      <div
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-xl border bg-card p-8",
          containerClassName
        )}
      >
        <BorderTrail
          className="bg-zinc-500"
          enabled={enabled}
          radius={radius}
          size={size}
          style={resolvedStyle}
          transition={resolvedTransition}
        />
        <div className="relative z-1 space-y-2">
          <p className="font-medium text-sm">Border trail</p>
          <p className="text-muted-foreground text-sm">
            Spotlight loops around the card edge via CSS offset-path.
          </p>
        </div>
      </div>
    </div>
  );
}
