"use client";

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

import { Slot } from "@/registry/primitives/animate/slot";
import type { WithAsChild } from "@/registry/primitives/animate/slot";

type ButtonProps = WithAsChild<
  HTMLMotionProps<"button"> & {
    hoverScale?: number;
    tapScale?: number;
  }
>;

function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
