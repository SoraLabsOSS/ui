"use client";

import { motion, type SVGMotionProps } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const HeroBackground = (props: SVGMotionProps<SVGSVGElement>) => {
  const { resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);

  const color = resolvedTheme === "dark" ? "#fff" : "#000";
  const opacity = resolvedTheme === "dark" ? 0.2 : 0.15;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <motion.svg
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      initial={{ opacity: 0, scale: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      viewBox="0 0 74.71 74.71"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <radialGradient
          cx="37.35"
          cy="37.35"
          fx="37.35"
          fy="37.35"
          gradientUnits="userSpaceOnUse"
          id="d"
          r="37.35"
        >
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M0 0h74.71v74.71H0z"
        fill="url(#d)"
        fillOpacity={opacity}
        id="c"
      />
    </motion.svg>
  );
};
