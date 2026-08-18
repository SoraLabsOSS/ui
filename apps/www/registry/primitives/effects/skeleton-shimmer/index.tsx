"use client";

import { cn } from "@workspace/ui/lib/utils";
import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useInsertionEffect,
} from "react";

// ---------------------------------------------------------------------------
// Theme-aware shimmer surface
//
// `--sk-shimmer-from` is the block fill; `--sk-shimmer-to` is the moving
// highlight. Both default to the app's `--muted` / `--foreground` tokens so
// the sweep stays visible on light and dark surfaces. Override either var
// (className or style) to retint.
// ---------------------------------------------------------------------------

const SHIMMER_FROM =
  "var(--sk-shimmer-from, color-mix(in oklab, var(--foreground, #111) 10%, var(--muted, #e8eaed)))";
const SHIMMER_TO =
  "var(--sk-shimmer-to, color-mix(in oklab, var(--foreground, #111) 22%, var(--muted, #e8eaed)))";
const SHIMMER_BG_IMAGE = `linear-gradient(90deg, ${SHIMMER_FROM} 25%, ${SHIMMER_TO} 50%, ${SHIMMER_FROM} 75%)`;

const SHIMMER_KEYFRAMES = {
  backgroundPosition: ["-200% 0", "200% 0"],
};

function getShimmerSurfaceStyle(
  borderRadius: number | string | undefined,
  style?: CSSProperties
): CSSProperties {
  return {
    backgroundColor: SHIMMER_FROM,
    backgroundImage: SHIMMER_BG_IMAGE,
    backgroundSize: "200% 100%",
    borderRadius,
    ...style,
  };
}

// ---------------------------------------------------------------------------
// SkeletonShimmer — standalone animated shimmer block primitive
// ---------------------------------------------------------------------------

export interface SkeletonShimmerProps extends HTMLMotionProps<"div"> {
  /**
   * Whether the shimmer animation is active.
   * @default true
   */
  animate?: boolean;
  /**
   * Border radius for the shimmer container.
   */
  borderRadius?: number | string;
  /**
   * Additional CSS class names. Override `--sk-shimmer-from` / `--sk-shimmer-to`
   * here to retint the block fill and highlight.
   */
  className?: string;
  /**
   * Shimmer sweep duration in seconds.
   * @default 1.5
   */
  duration?: number;
  /**
   * Ref forwarded to the underlying motion element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Optional custom inline styles.
   */
  style?: CSSProperties;
}

/**
 * A GPU-accelerated shimmer block primitive.
 * Respects `prefers-reduced-motion` automatically.
 */
export function SkeletonShimmer({
  duration = 1.5,
  borderRadius,
  className,
  style,
  animate: shouldAnimate = true,
  ref,
  ...props
}: SkeletonShimmerProps) {
  const prefersReducedMotion = useReducedMotion();
  const isAnimated = shouldAnimate && !prefersReducedMotion;

  return (
    <motion.div
      animate={isAnimated ? SHIMMER_KEYFRAMES : undefined}
      className={cn("overflow-hidden", className)}
      ref={ref}
      style={getShimmerSurfaceStyle(borderRadius, style)}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      }}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonOverlay — zero-layout-shift shimmer wrapper
// Sizes itself dynamically using hidden children (eliminates CLS)
// ---------------------------------------------------------------------------

export interface SkeletonOverlayProps extends HTMLMotionProps<"div"> {
  /**
   * Whether the shimmer animation is active.
   * @default true
   */
  animate?: boolean;
  /**
   * Border radius for the shimmer container.
   * @default "6px"
   */
  borderRadius?: number | string;
  /**
   * Children whose layout and dimensions define the skeleton's bounding box.
   */
  children: ReactNode;
  /**
   * Additional CSS class names. Override `--sk-shimmer-from` / `--sk-shimmer-to`
   * here to retint the block fill and highlight.
   */
  className?: string;
  /**
   * Shimmer sweep duration in seconds.
   * @default 1.5
   */
  duration?: number;
  /**
   * Ref forwarded to the underlying motion element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Optional custom inline styles.
   */
  style?: CSSProperties;
}

/**
 * Shimmer wrapper that hides its children visually with `visibility: hidden`
 * while using their exact dimensions to size itself. Guarantees 0 layout shift
 * when transitioning from loading state to revealed content.
 */
export function SkeletonOverlay({
  children,
  duration = 1.5,
  borderRadius = "6px",
  className,
  style,
  animate: shouldAnimate = true,
  ref,
  ...props
}: SkeletonOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const isAnimated = shouldAnimate && !prefersReducedMotion;

  return (
    <motion.div
      animate={isAnimated ? SHIMMER_KEYFRAMES : undefined}
      className={cn("min-h-min overflow-hidden", className)}
      ref={ref}
      style={getShimmerSurfaceStyle(borderRadius, style)}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      }}
      {...props}
    >
      {/* Children are invisible but maintain normal flow and dimensions */}
      <div aria-hidden="true" style={{ visibility: "hidden" }}>
        {children}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// View Transition Wipe CSS & Hook Helper
// Allows easily applying the right-to-left mask wipe on any view transition layer
// ---------------------------------------------------------------------------

export const VIEW_TRANSITION_WIPE_CSS = `
@property --sk-wipe {
  syntax: '<percentage>';
  inherits: true;
  initial-value: -100%;
}

::view-transition-group(skeleton-card) {
  border-radius: 16px;
  overflow: hidden;
}

::view-transition-image-pair(skeleton-card) {
  mix-blend-mode: normal;
}

::view-transition-old(skeleton-card) {
  z-index: 2;
  mask-image: linear-gradient(
    to right,
    black var(--sk-wipe),
    transparent calc(var(--sk-wipe) + 100%)
  );
  animation: sk-wipe-out 0.6s ease-in-out forwards;
}

::view-transition-new(skeleton-card) {
  animation: none;
}

@keyframes sk-wipe-out {
  from { --sk-wipe: 100%; }
  to   { --sk-wipe: -100%; }
}
`;

let wipeStylesInjected = false;

export function useViewTransitionWipeStyles() {
  useInsertionEffect(() => {
    if (wipeStylesInjected) {
      return;
    }
    wipeStylesInjected = true;
    const el = document.createElement("style");
    el.textContent = VIEW_TRANSITION_WIPE_CSS;
    document.head.appendChild(el);
  }, []);
}

export default SkeletonShimmer;
