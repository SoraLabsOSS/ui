"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export function FooterDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="h-px w-full origin-left bg-foreground/10"
      ref={ref}
    >
      <motion.div
        animate={isInView || shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
        className="h-full w-full origin-left bg-foreground/20"
        initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
