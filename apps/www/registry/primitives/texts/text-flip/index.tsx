"use client";

import { motion, useReducedMotion } from "motion/react";
import type { MotionProps, Transition } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { ComponentType, ElementType, ReactNode } from "react";

const NBSP = "\u00A0";
const WHITESPACE_SPLIT_REGEX = /(\s+)/;

const DEFAULT_TRANSITION: Transition = {
  type: "tween",
  duration: 0.5,
  ease: [0.65, 0, 0.35, 1],
};

export interface TextFlipProps {
  /** Render as a different element/component instead of `span`. @default "span" */
  as?: ElementType;
  className?: string;
  /** CSS `perspective` depth in pixels. @default 800 */
  depth?: number;
  /** Flip animation duration in seconds (ignored if `transition` is provided). @default 0.5 */
  duration?: number;
  /** Flip back when the pointer leaves. @default true */
  flipOut?: boolean;
  /** Optional link URL when `as` is `"a"` (or passed through to the rendered element). */
  href?: string;
  /** Reverse the X-axis rotation direction. @default false */
  reverse?: boolean;
  /** Per-character stagger delay in seconds. @default 0.03 */
  stagger?: number;
  /** Text to animate. */
  text: string;
  /** Custom Motion transition overriding `duration` and default easing. */
  transition?: Transition;
  /** Z-axis offset of front/back glyph faces for 3D separation. @default "0.1em" */
  zOffset?: number | string;
}

export function TextFlip({
  text,
  as: Component = "span",
  className,
  depth = 800,
  duration = 0.5,
  flipOut = true,
  href,
  reverse = false,
  stagger = 0.03,
  transition,
  zOffset = "0.1em",
}: TextFlipProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const [prevText, setPrevText] = useState(text);
  const isHoveredRef = useRef(false);

  if (prevText !== text) {
    setPrevText(text);
    setIsAnimating(false);
  }

  const MotionComponent = useMemo(
    () =>
      motion.create(Component as never) as ComponentType<
        MotionProps & {
          "aria-label"?: string;
          children?: ReactNode;
          className?: string;
          href?: string;
          onMouseEnter?: () => void;
          onMouseLeave?: () => void;
          style?: React.CSSProperties;
        }
      >,
    [Component]
  );

  const wordGroups = useMemo(() => {
    const rawWords = String(text).split(WHITESPACE_SPLIT_REGEX).filter(Boolean);
    const groups: { startIndex: number; word: string }[] = [];
    let offset = 0;
    for (const word of rawWords) {
      groups.push({ word, startIndex: offset });
      offset += word.length;
    }
    return groups;
  }, [text]);

  if (prefersReducedMotion) {
    return (
      <Component className={className} href={href}>
        {text}
      </Component>
    );
  }

  const totalChars = String(text).length;
  const directionMultiplier = reverse ? 1 : -1;
  const resolvedTransition: Transition = transition ?? {
    ...DEFAULT_TRANSITION,
    duration,
  };
  const resolvedZOffset =
    typeof zOffset === "number" ? `${zOffset}px` : zOffset;

  const targetRotation = flipCount * 180 * directionMultiplier;

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    setIsHovered(true);
    if (!isAnimating && totalChars > 0) {
      setIsAnimating(true);
      setFlipCount((count) => count + 1);
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setIsHovered(false);
    if (flipOut && !isAnimating && flipCount % 2 === 1 && totalChars > 0) {
      setIsAnimating(true);
      setFlipCount((count) => count + 1);
    }
  };

  const handleLastCharComplete = () => {
    if (flipOut && !isHoveredRef.current && flipCount % 2 === 1) {
      setFlipCount((count) => count + 1);
      return;
    }
    setIsAnimating(false);
  };

  return (
    <MotionComponent
      aria-label={text}
      className={className}
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        alignItems: "center",
        perspective: depth,
        transformStyle: "preserve-3d",
      }}
    >
      {wordGroups.map(({ word, startIndex }, wordIndex) => (
        <span
          aria-hidden="true"
          // oxlint-disable-next-line react/no-array-index-key, react-doctor/no-array-index-as-key -- static per-render word list, order never changes
          key={`${word}-${wordIndex}`}
          style={{
            display: "inline-flex",
            whiteSpace: "nowrap",
            transformStyle: "preserve-3d",
          }}
        >
          {word.split("").map((char, charOffset) => {
            const charIndex = startIndex + charOffset;
            const isLast = charIndex === totalChars - 1;
            const glyph = char.trim() === "" ? NBSP : char;

            return (
              <motion.span
                animate={{
                  rotateX: targetRotation,
                }}
                initial={false}
                // oxlint-disable-next-line react/no-array-index-key, react-doctor/no-array-index-as-key -- static per-render character list, order never changes
                key={`${wordIndex}-${charOffset}`}
                onAnimationComplete={
                  isLast ? handleLastCharComplete : undefined
                }
                style={{
                  position: "relative",
                  display: "inline-block",
                  transformStyle: "preserve-3d",
                  willChange: isHovered ? "transform" : undefined,
                }}
                transition={{
                  ...resolvedTransition,
                  delay: charIndex * stagger,
                }}
              >
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    backfaceVisibility: "hidden",
                    transform: `translateZ(${resolvedZOffset})`,
                  }}
                >
                  {glyph}
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    display: "inline-block",
                    backfaceVisibility: "hidden",
                    transform: `rotateX(180deg) translateZ(${resolvedZOffset})`,
                  }}
                >
                  {glyph}
                </span>
              </motion.span>
            );
          })}
        </span>
      ))}
    </MotionComponent>
  );
}
