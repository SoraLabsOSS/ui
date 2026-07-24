"use client";

import {
  type MotionProps,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
  useMemo,
  useRef,
} from "react";

const NBSP = " ";

type MarginValue = `${number}${"px" | "%"}`;
type InViewMargin =
  | MarginValue
  | `${MarginValue} ${MarginValue}`
  | `${MarginValue} ${MarginValue} ${MarginValue}`
  | `${MarginValue} ${MarginValue} ${MarginValue} ${MarginValue}`;

export interface RollingTextProps {
  /** Render as a different element/component instead of `span`. @default "span" */
  as?: ElementType;
  className?: string;
  /** Direction letters roll in when they enter the viewport. @default "up" */
  direction?: "down" | "up";
  /** Total settle duration per letter, in seconds. @default 4 */
  duration?: number;
  /** Margin passed to the in-view observer (same format as CSS `margin`). @default "-10%" */
  inViewMargin?: InViewMargin;
  /** Only trigger the roll once, the first time it scrolls into view. @default true */
  once?: boolean;
  ref?: Ref<HTMLElement>;
  /**
   * Extra per-letter delay added per character of distance from the center,
   * in seconds.
   * @default 0.05
   */
  speed?: number;
  /** Text to reveal. */
  text: string;
}

export function RollingText({
  text,
  speed = 0.05,
  duration = 4,
  direction = "up",
  once = true,
  inViewMargin = "-10%",
  as: Component = "span",
  className,
  ref: forwardedRef,
}: RollingTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once, margin: inViewMargin });
  const prefersReducedMotion = useReducedMotion();
  const centerIndex = Math.floor(text.length / 2);

  const MotionComponent = useMemo(
    () =>
      motion.create(Component as never) as ComponentType<
        MotionProps & {
          children?: ReactNode;
          className?: string;
          ref?: Ref<HTMLElement>;
        }
      >,
    [Component]
  );

  const mergedRef = (node: HTMLElement | null) => {
    containerRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  if (prefersReducedMotion) {
    return (
      <Component className={className} ref={forwardedRef}>
        {text}
      </Component>
    );
  }

  return (
    <MotionComponent aria-label={text} className={className} ref={mergedRef}>
      {text.split("").map((letter, index) => {
        const glyph = letter === " " ? NBSP : letter;
        const distanceFromCenter = Math.abs(index - centerIndex);
        const delay = distanceFromCenter * speed;
        const rollDuration = 0.2 + distanceFromCenter * 0.15;
        const numberOfRolls = Math.floor(duration / rollDuration);
        const totalMovement = numberOfRolls * 1.2;
        const restY = direction === "down" ? `-${totalMovement}em` : "0em";
        const settledY = direction === "down" ? "0em" : `-${totalMovement}em`;

        return (
          <span
            aria-hidden="true"
            className="relative inline-block overflow-hidden"
            // biome-ignore lint/suspicious/noArrayIndexKey: static per-render character list, order never changes
            key={`${letter}-${index}`}
            style={{ height: "1em" }}
          >
            <motion.span
              animate={isInView ? { y: settledY } : undefined}
              className="flex flex-col"
              initial={{ y: restY }}
              transition={{
                duration,
                ease: [0.15, 1, 0.1, 1],
                delay,
              }}
            >
              {new Array(numberOfRolls + 2).fill(null).map((_, copyIndex) => (
                <span
                  className="flex shrink-0 items-center justify-center"
                  // biome-ignore lint/suspicious/noArrayIndexKey: static per-render roll-copy list, order never changes
                  key={copyIndex}
                  style={{ height: "1.2em" }}
                >
                  {glyph}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </MotionComponent>
  );
}

export default RollingText;
