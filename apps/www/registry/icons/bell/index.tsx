"use client";

import { motion, type SVGMotionProps, useReducedMotion } from "motion/react";
import { useState } from "react";

interface BellProps extends Omit<SVGMotionProps<SVGSVGElement>, "animate"> {
  /**
   * Whether to trigger the rattle animation.
   * @default false
   */
  animate?: boolean;
  /**
   * Play the rattle animation when the icon is hovered.
   * @default true
   */
  animateOnHover?: boolean;
  /**
   * Any valid CSS color, mapped to the SVG `stroke`.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Repeat the rattle animation indefinitely.
   * @default false
   */
  loop?: boolean;
  /**
   * Icon size in pixels (applied to both width and height).
   * @default 24
   */
  size?: number | string;
}

const RATTLE = [0, -8, 4, -2, 1, -0.5, 0.25, 0];
const BELL_BODY =
  "M20 16.191C20 16.6378 19.6378 17 19.191 17H4.80902C4.36221 17 4 16.6378 4 16.191C4 16.0654 4.02924 15.9415 4.08541 15.8292L5.21846 13.5631C5.40413 13.1917 5.51071 12.7859 5.53144 12.3712L5.70037 8.99251C5.86822 5.63561 8.6389 3 12 3C15.3611 3 18.1318 5.63561 18.2996 8.99251L18.4686 12.3712C18.4893 12.7859 18.5959 13.1917 18.7815 13.5631L19.9146 15.8292C19.9708 15.9415 20 16.0654 20 16.191Z";
const BELL_CLAPPER =
  "M16 17C16 19.2091 14.2091 21 12 21C9.79086 21 8 19.2091 8 17";

function Bell({
  size = 24,
  color = "currentColor",
  animate = false,
  animateOnHover = true,
  loop = false,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: BellProps) {
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
        strokeWidth={2}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d={BELL_CLAPPER} />
        <path d={BELL_BODY} strokeLinecap="square" />
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
        animate={
          isTriggered
            ? {
                rotate: RATTLE,
                transition: {
                  duration: 0.6,
                  ease: "easeInOut",
                  repeat: loop ? Number.POSITIVE_INFINITY : 0,
                },
              }
            : { rotate: 0 }
        }
        initial={{ rotate: 0 }}
        style={{ transformOrigin: "50% 24%" }}
      >
        <path d={BELL_CLAPPER} />
        <path d={BELL_BODY} strokeLinecap="square" />
      </motion.g>
    </motion.svg>
  );
}

export {
  Bell,
  Bell as BellIcon,
  type BellProps,
  type BellProps as BellIconProps,
};
