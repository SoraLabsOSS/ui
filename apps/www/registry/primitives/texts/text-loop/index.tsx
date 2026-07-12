"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  type AnimatePresenceProps,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  Children,
  type ComponentPropsWithoutRef,
  type Ref,
  useEffect,
  useState,
} from "react";

const DEFAULT_VARIANTS: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

const DEFAULT_TRANSITION: Transition = { duration: 0.3 };

export type TextLoopProps = {
  /** Items to cycle through. Each child is shown for `interval` seconds. */
  children: React.ReactNode[];
  className?: string;
  /**
   * Seconds each item stays visible before advancing.
   * @default 2
   */
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  /**
   * Set to false to pause cycling.
   * @default true
   */
  trigger?: boolean;
  /**
   * `AnimatePresence` transition mode.
   * @default "popLayout"
   */
  mode?: AnimatePresenceProps["mode"];
  /**
   * ARIA live region politeness for the cycling text.
   * @default "off"
   */
  live?: "assertive" | "off" | "polite";
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = DEFAULT_TRANSITION,
  variants,
  onIndexChange,
  trigger = true,
  mode = "popLayout",
  live = "off",
  ref,
  ...props
}: TextLoopProps) {
  const items = Children.toArray(children);
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  useEffect(() => {
    if (!trigger || items.length < 2) {
      return;
    }

    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, trigger]);

  const activeItem = items[currentIndex];

  if (prefersReducedMotion) {
    return (
      <div
        aria-live={live === "off" ? undefined : live}
        className={cn("relative inline-block whitespace-nowrap", className)}
        ref={ref}
        {...props}
      >
        {activeItem}
      </div>
    );
  }

  return (
    <div
      aria-live={live === "off" ? undefined : live}
      className={cn("relative inline-block whitespace-nowrap", className)}
      ref={ref}
      {...props}
    >
      <AnimatePresence initial={false} mode={mode}>
        <motion.div
          animate="animate"
          exit="exit"
          initial="initial"
          key={currentIndex}
          transition={transition}
          variants={variants || DEFAULT_VARIANTS}
        >
          {activeItem}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
