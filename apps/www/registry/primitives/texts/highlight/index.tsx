"use client";

import { type HTMLMotionProps, motion } from "motion/react";
import type * as React from "react";

import {
  type UseIsInViewOptions,
  useIsInView,
} from "@/registry/hooks/use-is-in-view";

type HighlightTextProps = Omit<HTMLMotionProps<"span">, "children"> & {
  text: string;
  delay?: number;
} & UseIsInViewOptions;

function HighlightText({
  ref,
  text,
  style,
  inView = false,
  inViewMargin = "0px",
  inViewOnce = true,
  transition = { duration: 2, ease: "easeInOut" },
  delay = 0,
  ...props
}: HighlightTextProps) {
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    }
  );

  return (
    <motion.span
      animate={isInView ? { backgroundSize: "100% 100%" } : undefined}
      data-slot="highlight-text"
      initial={{ backgroundSize: "0% 100%" }}
      ref={localRef}
      style={{
        position: "relative",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline-block",
        ...style,
      }}
      transition={{
        ...transition,
        delay: (transition?.delay ?? 0) + delay / 1000,
      }}
      {...props}
    >
      {text}
    </motion.span>
  );
}

export { HighlightText, type HighlightTextProps };
