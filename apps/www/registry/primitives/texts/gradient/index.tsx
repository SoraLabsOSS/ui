"use client";

import { motion, type Transition } from "motion/react";
import type * as React from "react";

type GradientTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  text: string;
  gradient?: string;
  neon?: boolean;
  transition?: Transition;
};

function GradientText({
  text,
  style,
  gradient = "linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)",
  neon = false,
  transition = {
    duration: 50,
    repeat: Number.POSITIVE_INFINITY,
    ease: "linear",
  },
  ...props
}: GradientTextProps) {
  const baseStyle: React.CSSProperties = {
    backgroundImage: gradient,
    margin: 0,
    color: "transparent",
    backgroundClip: "text",
    backgroundSize: "700% 100%",
    backgroundPosition: "0% 0%",
  };

  return (
    <span
      data-slot="gradient-text"
      style={{ position: "relative", display: "inline-block", ...style }}
      {...props}
    >
      <motion.span
        animate={{ backgroundPosition: "500% 100%" }}
        initial={{ backgroundPosition: "0% 0%" }}
        style={baseStyle}
        transition={transition}
      >
        {text}
      </motion.span>

      {neon && (
        <motion.span
          animate={{ backgroundPosition: "500% 100%" }}
          initial={{ backgroundPosition: "0% 0%" }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            mixBlendMode: "plus-lighter",
            filter: "blur(8px)",
            ...baseStyle,
          }}
          transition={transition}
        >
          {text}
        </motion.span>
      )}
    </span>
  );
}

export { GradientText, type GradientTextProps };
