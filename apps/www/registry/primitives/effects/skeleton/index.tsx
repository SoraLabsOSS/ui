"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect,
  useState,
} from "react";

// Skeleton only reads --sk-muted (surface fill) and --sk-foreground (shimmer
// highlight). Both default to the app's own shadcn tokens when present, so
// the skeleton matches the surrounding theme out of the box — override
// either var directly (className or style) to use different colors.
const componentThemeClassName =
  "[--sk-muted:var(--muted,#f5f7fa)] [--sk-foreground:var(--foreground,#111111)]";

const STYLE_ID = "sk-styles";

const SKELETON_CSS = `
@keyframes sk-shimmer {
  to {
    transform: translateX(200%);
  }
}

.sk-surface {
  background-color: #f5f7fa;
  background-color: var(--sk-muted);
}

.sk-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(17, 17, 17, 0.06) 50%,
    transparent 100%
  );
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--sk-foreground) 6%, transparent) 50%,
    transparent 100%
  );
  animation: sk-shimmer var(--sk-duration, 1.6s)
    ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .sk-shimmer {
    animation: none;
  }
}
`;

type SkeletonRounded = "none" | "sm" | "md" | "lg" | "full";
type SkeletonVariant = "shimmer" | "fade";

const skeletonRoundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const satisfies Record<SkeletonRounded, string>;

const skeletonVariantDefaultDuration: Record<SkeletonVariant, number> = {
  shimmer: 1.6,
  fade: 2.4,
};

function getSkeletonVariantDuration(
  variant: SkeletonVariant,
  duration?: number
) {
  return duration ?? skeletonVariantDefaultDuration[variant];
}

function ensureSkeletonStyles() {
  if (typeof document === "undefined") {
    return;
  }

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = SKELETON_CSS;
}

function resolveSkeletonA11yProps({
  animate = true,
  decorative = true,
  label,
}: {
  animate?: boolean;
  decorative?: boolean;
  label?: string | null;
}) {
  if (decorative || label === null) {
    return { "aria-hidden": true as const };
  }

  return {
    "aria-label": label ?? (animate ? "Loading" : "Placeholder"),
    "aria-live": "polite" as const,
    role: "status" as const,
  };
}

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  decorative?: boolean;
  duration?: number;
  label?: string | null;
  ref?: Ref<HTMLDivElement>;
  rounded?: SkeletonRounded;
  variant?: SkeletonVariant;
}

function Skeleton({
  animate = true,
  className,
  decorative = true,
  duration,
  label,
  ref,
  rounded = "md",
  style,
  variant = "shimmer",
  ...props
}: SkeletonProps) {
  const variantDuration = getSkeletonVariantDuration(variant, duration);
  const showShimmer = animate && variant === "shimmer";
  const showFade = animate && variant === "fade";

  useEffect(() => {
    if (showShimmer) {
      ensureSkeletonStyles();
    }
  }, [showShimmer]);

  let animatedStyle = style;
  if (showShimmer) {
    animatedStyle = {
      ...style,
      "--sk-duration": `${variantDuration}s`,
    } as CSSProperties;
  } else if (showFade) {
    animatedStyle = { ...style, animationDuration: `${variantDuration}s` };
  }

  return (
    <div
      className={cn(
        componentThemeClassName,
        "sk-surface relative block h-4 w-full overflow-hidden",
        showFade && "animate-pulse motion-reduce:animate-none",
        skeletonRoundedClasses[rounded],
        className
      )}
      ref={ref}
      style={animatedStyle}
      {...resolveSkeletonA11yProps({ animate, decorative, label })}
      {...props}
    >
      {showShimmer ? (
        <span
          aria-hidden="true"
          className="sk-shimmer pointer-events-none absolute inset-0 -translate-x-full"
        />
      ) : null}
    </div>
  );
}

function SkeletonAvatar({
  className,
  ...props
}: Omit<SkeletonProps, "rounded">) {
  return (
    <Skeleton
      className={cn("size-10", className)}
      decorative
      rounded="full"
      {...props}
    />
  );
}

function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-3", className)} decorative {...props} />;
}

function SkeletonButton({
  className,
  ...props
}: Omit<SkeletonProps, "rounded">) {
  return (
    <Skeleton
      className={cn("h-9 w-24", className)}
      decorative
      rounded="lg"
      {...props}
    />
  );
}

const ShimmerSkeleton = Skeleton;

type SkeletonTransitionPhase = "done" | "loading" | "revealing" | "settling";

const SKELETON_TRANSITION_DEFAULT_SETTLE_DURATION = 0.4;
const SKELETON_TRANSITION_DEFAULT_FADE_DURATION = 0.15;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface SkeletonTransitionProps {
  children: ReactNode;
  className?: string;
  /**
   * Crossfade duration between skeleton and content, in seconds.
   * @default 0.15
   */
  fadeDuration?: number;
  /** While true, only `skeleton` is shown. Flipping to false plays the reveal. */
  loading: boolean;
  /**
   * How long the skeleton lingers after `loading` turns false, before the
   * crossfade starts, in seconds. Gives the shimmer a beat to settle instead
   * of cutting away mid-cycle.
   * @default 0.4
   */
  settleDuration?: number;
  /** Placeholder shown while `loading` is true — typically `Skeleton` or its variants. */
  skeleton: ReactNode;
}

/**
 * Swaps a skeleton placeholder for real content once loading finishes: the
 * shimmer settles for a beat, then skeleton and content crossfade.
 *
 * While both are mounted, `children` is absolutely positioned (so it overlays
 * `skeleton`, which drives the wrapper's height). If the two differ a lot in
 * size, the layout snaps to the content's real height the instant the
 * crossfade finishes — size `skeleton` close to the expected content to
 * avoid a visible jump.
 */
function SkeletonTransition({
  children,
  className,
  fadeDuration = SKELETON_TRANSITION_DEFAULT_FADE_DURATION,
  loading,
  settleDuration = SKELETON_TRANSITION_DEFAULT_SETTLE_DURATION,
  skeleton,
}: SkeletonTransitionProps) {
  const [phase, setPhase] = useState<SkeletonTransitionPhase>(
    loading ? "loading" : "done"
  );

  useEffect(() => {
    if (loading) {
      setPhase("loading");
      return;
    }
    setPhase(prefersReducedMotion() ? "done" : "settling");
  }, [loading]);

  useEffect(() => {
    if (phase !== "settling") {
      return;
    }
    const timer = window.setTimeout(
      () => setPhase("revealing"),
      settleDuration * 1000
    );
    return () => window.clearTimeout(timer);
  }, [phase, settleDuration]);

  useEffect(() => {
    if (phase !== "revealing") {
      return;
    }
    const timer = window.setTimeout(
      () => setPhase("done"),
      fadeDuration * 1000
    );
    return () => window.clearTimeout(timer);
  }, [phase, fadeDuration]);

  const showSkeleton = phase !== "done";
  const showContent = phase !== "loading";
  const crossfading = phase === "revealing" || phase === "done";
  const fadeStyle: CSSProperties = { transitionDuration: `${fadeDuration}s` };

  return (
    <div className={cn("relative", className)}>
      {showSkeleton && (
        <div
          aria-hidden="true"
          className={cn(
            "transition-opacity ease-out",
            crossfading ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          style={fadeStyle}
        >
          {skeleton}
        </div>
      )}
      {showContent && (
        <div
          className={cn(
            showSkeleton && "absolute inset-0",
            "transition-opacity ease-out",
            crossfading ? "opacity-100" : "opacity-0"
          )}
          style={fadeStyle}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export {
  getSkeletonVariantDuration,
  resolveSkeletonA11yProps,
  ShimmerSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
  SkeletonTransition,
  skeletonRoundedClasses,
  skeletonVariantDefaultDuration,
};
export default Skeleton;
export type {
  SkeletonProps,
  SkeletonProps as ShimmerSkeletonProps,
  SkeletonRounded,
  SkeletonTransitionProps,
  SkeletonVariant,
};
