"use client";

import { motion, type SVGMotionProps, useReducedMotion } from "motion/react";
import { useState } from "react";

interface ChevronsProps extends Omit<SVGMotionProps<SVGSVGElement>, "animate"> {
  /**
   * Whether to trigger the caret animation.
   * @default false
   */
  animate?: boolean;
  /**
   * Play the animation when the icon is hovered.
   * @default true
   */
  animateOnHover?: boolean;
  /**
   * Any valid CSS color, mapped to the SVG `stroke`.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Repeat the animation indefinitely.
   * @default false
   */
  loop?: boolean;
  /**
   * Icon size in pixels (applied to both width and height).
   * @default 16
   */
  size?: number | string;
}

const TOP_END = [0, 0, 0.15, 1, 1, 0.85, 0, 0.15, 1];
const BOTTOM_END = [0, 1, 1, 0.85, 0, 0, 0, 1, 1];
const TIMES_END = [0, 0.16, 0.21, 0.36, 0.51, 0.57, 0.71, 0.85, 1];

function Chevrons({
  size = 16,
  color = "currentColor",
  animate = false,
  animateOnHover = true,
  loop = false,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ChevronsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const isTriggered = animate || (animateOnHover && isHovered);

  if (reducedMotion) {
    return (
      <motion.svg
        aria-hidden="true"
        className={className}
        fill="none"
        height={size}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.25}
        viewBox="0 0 16 16"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d="M5.2168 6.90625L8.3418 3.78125L11.4668 6.90625" />
        <path d="M5.2168 11.2812L8.3418 8.15625L11.4668 11.2812" />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      className={className}
      fill="none"
      height={size}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (typeof onMouseEnter === "function") {
          onMouseEnter(e);
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (typeof onMouseLeave === "function") {
          onMouseLeave(e);
        }
      }}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        animate={
          isTriggered
            ? {
                opacity: TOP_END,
                transition: {
                  duration: 1.05,
                  ease: "easeInOut",
                  times: TIMES_END,
                  repeat: loop ? Number.POSITIVE_INFINITY : 0,
                },
              }
            : { opacity: 1 }
        }
        d="M5.2168 6.90625L8.3418 3.78125L11.4668 6.90625"
        initial={{ opacity: 1 }}
      />
      <motion.path
        animate={
          isTriggered
            ? {
                opacity: BOTTOM_END,
                transition: {
                  duration: 1.05,
                  ease: "easeInOut",
                  times: TIMES_END,
                  repeat: loop ? Number.POSITIVE_INFINITY : 0,
                },
              }
            : { opacity: 1 }
        }
        d="M5.2168 11.2812L8.3418 8.15625L11.4668 11.2812"
        initial={{ opacity: 1 }}
      />
    </motion.svg>
  );
}

export {
  Chevrons,
  Chevrons as ChevronsIcon,
  type ChevronsProps,
  type ChevronsProps as ChevronsIconProps,
};
