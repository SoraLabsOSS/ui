"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  motion,
  type SVGMotionProps,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { useState } from "react";

interface MenuProps extends Omit<SVGMotionProps<SVGSVGElement>, "animate"> {
  /**
   * Whether to animate the icon into the close (X) state.
   * @default false
   */
  animate?: boolean;
  /**
   * Play the animation when the icon is hovered.
   * @default false
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
   * Convenience controlled state for open/close.
   */
  open?: boolean;
  /**
   * Icon size in pixels (applied to both width and height).
   * @default 24
   */
  size?: number | string;
  /**
   * Stroke width of the lines.
   * @default 2
   */
  strokeWidth?: number | string;
  /**
   * Custom spring/transition configuration.
   */
  transition?: Transition;
}

function Menu({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  animate = false,
  open,
  loop = false,
  animateOnHover = false,
  className,
  transition: transitionProp,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}: MenuProps) {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const isClose =
    (open === undefined ? animate : open) || (animateOnHover && isHovered);

  const transition: Transition =
    transitionProp ??
    (reducedMotion
      ? { duration: 0 }
      : {
          type: "spring",
          stiffness: 260,
          damping: 17,
          ...(loop && {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            repeatDelay: 0.5,
          }),
        });

  return (
    <motion.svg
      className={cn("cursor-pointer select-none", className)}
      fill="none"
      height={size}
      onClick={(e) => {
        if (typeof onClick === "function") {
          onClick(e);
        }
      }}
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
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.line
        animate={{
          y: isClose ? 6 : 0,
          rotate: isClose ? 45 : 0,
        }}
        style={{ transformOrigin: "12px 12px" }}
        transition={transition}
        x1="3.5"
        x2="20.5"
        y1="6"
        y2="6"
      />
      <motion.line
        animate={{ opacity: isClose ? 0 : 1 }}
        style={{ transformOrigin: "12px 12px" }}
        transition={{ duration: 0.1 }}
        x1="3.5"
        x2="20.5"
        y1="12"
        y2="12"
      />
      <motion.line
        animate={{
          y: isClose ? -6 : 0,
          rotate: isClose ? -45 : 0,
        }}
        style={{ transformOrigin: "12px 12px" }}
        transition={transition}
        x1="3.5"
        x2="20.5"
        y1="18"
        y2="18"
      />
    </motion.svg>
  );
}

export {
  Menu,
  Menu as MenuIcon,
  type MenuProps,
  type MenuProps as MenuIconProps,
};
