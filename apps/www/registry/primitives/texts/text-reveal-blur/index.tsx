/** biome-ignore-all lint/suspicious/noArrayIndexKey: These are static content and the indices are stable. */

"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, type UseInViewOptions, useInView } from "motion/react";
import { type ElementType, useMemo, useRef } from "react";

export interface BlurTextRevealProps {
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

export function BlurTextReveal({
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
}: BlurTextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, margin: viewportMargin });

  const words = useMemo(() => text.split(WHITESPACE_RE), [text]);

  // Pre-calculate character structures and global stagger indices to prevent mid-word wrapping
  const parsedWords = useMemo(() => {
    let charCount = 0;
    return words.map((word) => {
      const chars = word.split("").map((char) => {
        const globalIndex = charCount;
        charCount++;
        return { char, globalIndex };
      });
      return { word, chars };
    });
  }, [words]);

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
      {splitBy === "words"
        ? words.map((word, i) => (
            <span className="inline-block" key={i}>
              <motion.span
                animate={isInView ? visibleState : hiddenState}
                aria-hidden="true"
                className={cn(
                  "inline-block will-change-[opacity,filter,transform]",
                  unitClassName
                )}
                initial={hiddenState}
                transition={{
                  duration,
                  delay: delay + i * staggerDelay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {word}
              </motion.span>
              {i < words.length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </span>
          ))
        : parsedWords.map((wordData, wordIdx) => (
            <span className="inline-block whitespace-nowrap" key={wordIdx}>
              {wordData.chars.map((charData, charIdx) => (
                <motion.span
                  animate={isInView ? visibleState : hiddenState}
                  aria-hidden="true"
                  className={cn(
                    "inline-block will-change-[opacity,filter,transform]",
                    unitClassName
                  )}
                  initial={hiddenState}
                  key={charIdx}
                  transition={{
                    duration,
                    delay: delay + charData.globalIndex * staggerDelay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {charData.char}
                </motion.span>
              ))}
              {wordIdx < parsedWords.length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </span>
          ))}
    </Component>
  );
}
