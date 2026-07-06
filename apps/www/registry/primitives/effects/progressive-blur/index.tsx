"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type CSSProperties, useMemo } from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

// Reads --pb-background for the optional solid-fade layer only. Defaults to
// the app's own shadcn --background token when present, so the fade lands on
// the surrounding surface color out of the box. The light-dark() fallback
// only kicks in for apps with neither shadcn tokens nor a declared
// color-scheme, so it degrades to plain white — override --pb-background
// directly (className or style) if the edge sits on a dark surface without
// shadcn tokens.
const componentThemeClassName =
  "[--pb-background:var(--background,light-dark(#ffffff,#0a0a0a))]";

const MAX_LAYERS = 16;
// backdrop-filter is a per-layer paint cost, so reduced motion drops straight
// to a single band — same silhouette, a sixth of the paints.
const REDUCED_MOTION_LAYERS = 1;

type ProgressiveBlurDirection = "top" | "bottom" | "left" | "right";

const directionGradientAngle = {
  top: "to bottom",
  bottom: "to top",
  left: "to right",
  right: "to left",
} as const satisfies Record<ProgressiveBlurDirection, string>;

const directionSizeProperty = {
  top: "height",
  bottom: "height",
  left: "width",
  right: "width",
} as const satisfies Record<ProgressiveBlurDirection, "height" | "width">;

interface ProgressiveBlurProps {
  className?: string;
  /** Edge the blur ramps in from. @default "bottom" */
  direction?: ProgressiveBlurDirection;
  /**
   * Add a final solid-color layer that fades to `--pb-background` right at
   * the edge, fully hiding content instead of leaving a faint blurred trace.
   * @default true
   */
  fade?: boolean;
  /**
   * Number of stacked blur layers, clamped to 1–16. Each layer's mask
   * isolates a band of the fade zone, so more layers read as a smoother
   * ramp at the cost of more `backdrop-filter` paints. Ignored (forced to
   * 1) when the OS Reduced Motion setting is on.
   * @default 6
   */
  layers?: number;
  /** Strongest blur radius, reached by the layer nearest the edge, in px. @default 12 */
  maxBlur?: number;
  /** Depth of the blurred region along `direction`, any CSS length. @default "6rem" */
  size?: string;
  style?: CSSProperties;
}

function getLayerBlurPx(index: number, layerCount: number, maxBlur: number) {
  // Doubles per layer toward the edge (…maxBlur/4, maxBlur/2, maxBlur) rather
  // than scaling linearly — blur perceptually compounds, so a linear ramp
  // reads as mostly-sharp-then-a-sudden-smear instead of a gradual fade.
  return maxBlur * 2 ** (index - layerCount + 1);
}

function getLayerMaskImage(
  direction: ProgressiveBlurDirection,
  index: number,
  layerCount: number
) {
  // `directionGradientAngle` points 0% at the pinned edge (e.g. the box's
  // own top, for direction="top"). The strongest layer (highest `index`)
  // must band nearest that edge, so its position runs opposite to `index`.
  const bandIndex = layerCount - 1 - index;
  const step = 100 / layerCount;
  const start = bandIndex * step;
  const rampIn = Math.min(100, (bandIndex + 1) * step);
  const rampOutStart = Math.min(100, (bandIndex + 2) * step);
  const end = Math.min(100, (bandIndex + 3) * step);

  return `linear-gradient(${directionGradientAngle[direction]}, transparent ${start}%, black ${rampIn}%, black ${rampOutStart}%, transparent ${end}%)`;
}

function ProgressiveBlur({
  className,
  direction = "bottom",
  fade = true,
  layers = 6,
  maxBlur = 12,
  size = "6rem",
  style,
}: ProgressiveBlurProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const clampedMaxBlur = Math.max(0, maxBlur);
  const layerCount = prefersReducedMotion
    ? REDUCED_MOTION_LAYERS
    : Math.min(MAX_LAYERS, Math.max(1, Math.trunc(layers)));

  const blurLayers = useMemo(
    () =>
      Array.from({ length: layerCount }, (_, index) => {
        const blurPx = getLayerBlurPx(index, layerCount, clampedMaxBlur);
        const maskImage = getLayerMaskImage(direction, index, layerCount);

        return { blurPx, id: `${direction}-${layerCount}-${index}`, maskImage };
      }),
    [direction, layerCount, clampedMaxBlur]
  );

  const sizeStyle: CSSProperties = {
    [directionSizeProperty[direction]]: size,
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        componentThemeClassName,
        "pointer-events-none absolute select-none",
        direction === "top" && "inset-x-0 top-0",
        direction === "bottom" && "inset-x-0 bottom-0",
        direction === "left" && "inset-y-0 left-0",
        direction === "right" && "inset-y-0 right-0",
        className
      )}
      style={{ ...sizeStyle, ...style }}
    >
      {blurLayers.map((layer) => (
        <div
          className="absolute inset-0"
          key={layer.id}
          style={{
            backdropFilter: `blur(${layer.blurPx}px)`,
            maskImage: layer.maskImage,
            WebkitBackdropFilter: `blur(${layer.blurPx}px)`,
            WebkitMaskImage: layer.maskImage,
          }}
        />
      ))}
      {fade ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${directionGradientAngle[direction]}, var(--pb-background), transparent)`,
          }}
        />
      ) : null}
    </div>
  );
}

export type { ProgressiveBlurDirection, ProgressiveBlurProps };
export { ProgressiveBlur };
