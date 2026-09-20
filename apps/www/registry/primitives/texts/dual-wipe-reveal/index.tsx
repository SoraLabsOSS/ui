"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, useInView, useReducedMotion } from "motion/react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
  Ref,
} from "react";
import { useImperativeHandle, useRef } from "react";

export type DualWipeRevealDirection = "left" | "right" | "up" | "down";

const DIRECTION_MAP = {
  left: { axis: "scaleX", originClass: "origin-right" },
  right: { axis: "scaleX", originClass: "origin-left" },
  down: { axis: "scaleY", originClass: "origin-bottom" },
  up: { axis: "scaleY", originClass: "origin-top" },
} as const;

/** Exact cubic-bezier equivalent of GSAP power3.inOut */
const EASE_POWER3_IN_OUT = [0.65, 0, 0.35, 1] as const;

function isCssColorValue(value?: string): boolean {
  if (!value) {
    return false;
  }
  return (
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl") ||
    value.startsWith("var(")
  );
}

export interface DualWipeRevealProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Primary accent wipe color class or CSS color.
   * Revealed briefly as the top wipe curtain uncovers.
   * @default "bg-foreground"
   */
  accentColor?: string;
  /**
   * HTML tag for the container element.
   * @default "span"
   */
  as?: ElementType;
  /**
   * Content to reveal.
   */
  children?: ReactNode;
  /**
   * Additional className merged onto the root element.
   */
  className?: string;
  /**
   * Delay before the animation starts, in seconds.
   * @default 0
   */
  delay?: number;
  /**
   * Wipe travel direction.
   * - "left": reveals text from left to right (wipes shrink towards right).
   * - "right": reveals text from right to left (wipes shrink towards left).
   * - "down": reveals text from top to bottom (wipes shrink towards bottom).
   * - "up": reveals text from bottom to top (wipes shrink towards top).
   * @default "left"
   */
  direction?: DualWipeRevealDirection;
  /**
   * Duration of each wipe curtain animation, in seconds.
   * @default 0.5
   */
  duration?: number;
  /**
   * Root margin for in-view trigger (defaults to matching GSAP top 82%).
   * @default "0px 0px -18% 0px"
   */
  inViewMargin?: string;
  /**
   * Whether to animate only once when entering viewport.
   * @default true
   */
  once?: boolean;
  /**
   * Ref forwarded to the container element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Stagger delay between the top wipe and the accent wipe, in seconds.
   * @default 0.1
   */
  stagger?: number;
  /**
   * Explicit control over the revealed state. If provided, overrides viewport detection.
   */
  trigger?: boolean;
  /**
   * Top wipe cover color class or CSS color.
   * Initially covers the entire text block.
   * @default "bg-neutral-800"
   */
  wipeColor?: string;
}

export function DualWipeReveal({
  accentColor = "bg-foreground",
  as: Component = "span",
  children,
  className,
  delay = 0,
  direction = "left",
  duration = 0.5,
  inViewMargin = "0px 0px -18% 0px",
  once = true,
  ref,
  stagger = 0.1,
  trigger,
  wipeColor = "bg-neutral-800",
  ...props
}: DualWipeRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => containerRef.current as HTMLElement);

  const isInView = useInView(containerRef, {
    once,
    margin: inViewMargin as never,
  });

  const prefersReducedMotion = useReducedMotion();
  const isRevealed = trigger === undefined ? isInView : trigger;

  if (prefersReducedMotion) {
    return (
      <Component
        className={cn("inline-block align-top", className)}
        ref={containerRef}
        {...props}
      >
        {children}
      </Component>
    );
  }

  const { axis, originClass } = DIRECTION_MAP[direction];
  const isAccentCss = isCssColorValue(accentColor);
  const isWipeCss = isCssColorValue(wipeColor);

  const scale = isRevealed ? 0 : 1;
  const initialMotion = axis === "scaleX" ? { scaleX: 1 } : { scaleY: 1 };
  const targetMotion =
    axis === "scaleX" ? { scaleX: scale } : { scaleY: scale };

  return (
    <Component
      className={cn(
        "relative inline-block overflow-hidden align-top",
        className
      )}
      data-slot="dual-wipe-reveal"
      ref={containerRef}
      {...props}
    >
      <span className="block whitespace-nowrap">{children}</span>

      {/* Layer 1: Accent / Brand wipe curtain */}
      <motion.span
        animate={targetMotion}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-[0.1em] z-10 block will-change-transform",
          originClass,
          !isAccentCss && accentColor
        )}
        initial={initialMotion}
        style={isAccentCss ? { backgroundColor: accentColor } : undefined}
        transition={{
          duration,
          delay: delay + stagger,
          ease: EASE_POWER3_IN_OUT,
        }}
      />

      {/* Layer 2: Foreground cover wipe curtain */}
      <motion.span
        animate={targetMotion}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-[0.1em] z-20 block will-change-transform",
          originClass,
          !isWipeCss && wipeColor
        )}
        initial={initialMotion}
        style={isWipeCss ? { backgroundColor: wipeColor } : undefined}
        transition={{
          duration,
          delay,
          ease: EASE_POWER3_IN_OUT,
        }}
      />
    </Component>
  );
}
