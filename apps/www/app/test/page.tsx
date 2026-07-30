"use client";

import { motion, useReducedMotion } from "motion/react";

// frames:      1    2    3    4    5   (fade chồng nhẹ giữa các frame)
const TOP = [0, 0, 0.15, 1, 1, 0.85, 0];
const BOTTOM = [0, 1, 1, 0.85, 0, 0, 0];
const TIMES = [0, 0.22, 0.3, 0.5, 0.72, 0.8, 1];

const transition = {
  duration: 0.75,
  ease: "easeInOut" as const,
  repeat: Number.POSITIVE_INFINITY,
  times: TIMES,
};

export default function Testpage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="flex items-center rounded-lg font-medium text-sky-500 text-sm capitalize">
        new
        <svg
          fill="none"
          height="20"
          viewBox="0 0 16 16"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={reducedMotion ? { opacity: 1 } : { opacity: BOTTOM }}
            d="M5.2168 11.2812L8.3418 8.15625L11.4668 11.2812"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
            transition={reducedMotion ? undefined : transition}
          />
          <motion.path
            animate={reducedMotion ? { opacity: 1 } : { opacity: TOP }}
            d="M5.2168 6.90625L8.3418 3.78125L11.4668 6.90625"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
            transition={reducedMotion ? undefined : transition}
          />
        </svg>
      </span>
    </div>
  );
}
