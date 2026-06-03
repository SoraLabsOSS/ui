"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, type UseInViewOptions, useInView } from "motion/react";
import { type ElementType, useMemo, useRef } from "react";

export interface TextRevealProps {
  /**
   * HTML tag for the container element.
   * @default "p"
   */
  as?: keyof React.JSX.IntrinsicElements;
  /**
   * Blur amount in pixels for the hidden state.
   * @default 4
   */
  blur?: number;
  className?: string;
  /**
   * Delay before the first unit starts animating, in seconds.
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
   * Delay between each successive unit in seconds.
   * @default 0.05
   */
  staggerDelay?: number;
  /** The text to animate. */
  text?: string;
  /**
   * Additional className applied to each animated span.
   */
  unitClassName?: string;
  /**
   * Viewport margin that controls when the animation triggers.
   * @default "0px 0px -10% 0px"
   */
  viewportMargin?: UseInViewOptions["margin"];
  /**
   * Initial vertical offset in pixels.
   * @default 0
   */
  yOffset?: number;
}

const WHITESPACE_RE = /\s+/;

function splitText(text: string, splitBy: "words" | "characters"): string[] {
  if (splitBy === "characters") {
    return text.split("").map((ch) => (ch === " " ? "\u00A0" : ch));
  }

  const words = text.split(WHITESPACE_RE);
  return words.map((word, i) =>
    i < words.length - 1 ? `${word}\u00A0` : word
  );
}

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

  const units = useMemo(() => splitText(text, splitBy), [text, splitBy]);

  const hiddenState = useMemo(
    () => ({ opacity: 0, y: yOffset, filter: `blur(${blur}px)` }),
    [blur, yOffset]
  );

  const visibleState = { opacity: 1, y: 0, filter: "blur(0px)" };

  const Component = Tag as ElementType;

  return (
    <Component
      aria-label={text}
      className={cn("leading-relaxed", className)}
      ref={ref}
    >
      {units.map((unit, i) => (
        <motion.span
          animate={isInView ? visibleState : hiddenState}
          aria-hidden="true"
          className={cn(
            "inline-block will-change-[opacity,filter,transform]",
            unitClassName
          )}
          initial={hiddenState}
          // biome-ignore lint/suspicious/noArrayIndexKey: Static content split into units; index is stable.
          key={i}
          transition={{
            duration,
            delay: delay + i * staggerDelay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {unit}
        </motion.span>
      ))}
    </Component>
  );
}
