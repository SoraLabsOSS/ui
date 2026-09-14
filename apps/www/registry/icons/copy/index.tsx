"use client";

import {
  motion,
  type SVGMotionProps,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useState } from "react";

interface CopyProps extends Omit<SVGMotionProps<SVGSVGElement>, "animate"> {
  /**
   * Whether to animate the icon into its checkmark state.
   * @default false
   */
  animate?: boolean;
  /**
   * Play the animation while the icon is hovered.
   * @default false
   */
  animateOnHover?: boolean;
  /**
   * Any valid CSS color, mapped to the SVG `stroke`.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Convenience trigger prop. When true, transitions the icon into its checkmark state.
   * Equivalent to `animate={copied}`.
   */
  copied?: boolean;
  /**
   * Icon size in pixels (applied to both width and height).
   * @default 24
   */
  size?: number | string;
}

const copyVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.25, ease: "easeInOut" },
  },
  animate: {
    scale: 0,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

const checkVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.25, ease: "easeInOut" },
  },
  animate: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

function Copy({
  size = 24,
  color = "currentColor",
  animate = false,
  copied,
  animateOnHover = false,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: CopyProps) {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const isTriggered =
    (copied === undefined ? animate : copied) || (animateOnHover && isHovered);

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
        strokeWidth={2}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {isTriggered ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
          </>
        )}
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
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.g
        animate={isTriggered ? "animate" : "initial"}
        initial="initial"
        style={{ transformOrigin: "12px 12px" }}
        variants={copyVariants}
      >
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
      </motion.g>
      <motion.g
        animate={isTriggered ? "animate" : "initial"}
        initial="initial"
        style={{ transformOrigin: "12px 12px" }}
        variants={checkVariants}
      >
        <path d="M20 6 9 17l-5-5" />
      </motion.g>
    </motion.svg>
  );
}

export {
  Copy,
  Copy as CopyIcon,
  type CopyProps,
  type CopyProps as CopyIconProps,
};
