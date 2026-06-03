"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, type UseInViewOptions, useInView } from "motion/react";
import { type ElementType, useRef } from "react";

export interface TextRevealProps {
  /**
   * HTML tag for the container element.
   * @default "p"
   */
  as?: keyof React.JSX.IntrinsicElements;
  /**
   * Blur amount in pixels for initial state.
   * @default 4
   */
  blur?: number;
  className?: string;
  /**
   * Delay before starting the animation in seconds.
   * @default 0.5
   */
  delay?: number;
  /**
   * Duration of each unit's animation in seconds.
   * @default 0.5
   */
  duration?: number;
  /**
   * Trigger the animation only once.
   * @default true
   */
  once?: boolean;
  /**
   * Split mode: word-by-word or character-by-character.
   * @default "words"
   */
  splitBy?: "words" | "characters";
  /**
   * Delay between each word/character animation in seconds.
   * @default 0.05
   */
  staggerDelay?: number;
  /** The text to animate. */
  text?: string;
  /**
   * Additional className for each animated span unit.
   */
  unitClassName?: string;
  /**
   * Viewport margin for trigger.
   * @default "0px 0px -10% 0px"
   */
  viewportMargin?: UseInViewOptions["margin"];
  /**
   * Initial vertical offset in pixels.
   * @default 0
   */
  yOffset?: number;
}

const SPLIT_REGEX = /\s+/;

export function TextReveal({
  text = "",
  as: Tag = "p",
  splitBy = "words",
  staggerDelay = 0.05,
  delay = 0.5,
  duration = 0.5,
  once = true,
  blur = 4,
  yOffset = 0,
  viewportMargin = "0px 0px -10% 0px",
  className,
  unitClassName,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, margin: viewportMargin });

  const units =
    splitBy === "words"
      ? text
          .split(SPLIT_REGEX)
          .map((w, i, arr) => (i < arr.length - 1 ? `${w}\u00A0` : w))
      : text.split("").map((c) => (c === " " ? "\u00A0" : c));

  const Component = Tag as ElementType;

  return (
    <Component
      aria-label={text}
      className={cn("leading-relaxed", className)}
      ref={ref}
    >
      {units.map((unit, i) => (
        <motion.span
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: yOffset, filter: `blur(${blur}px)` }
          }
          aria-hidden="true"
          className={cn(
            "will-change-[opacity,filter,transform]",
            unitClassName
          )}
          initial={{ opacity: 0, y: yOffset, filter: `blur(${blur}px)` }}
          // biome-ignore lint/suspicious/noArrayIndexKey: Static content split into words/characters, index is stable.
          key={i}
          style={{ display: "inline-block" }}
          transition={{
            duration,
            delay: delay + i * staggerDelay,
            ease: "easeOut",
          }}
        >
          {unit}
        </motion.span>
      ))}
    </Component>
  );
}
