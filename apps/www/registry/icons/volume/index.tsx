"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  motion,
  type SVGMotionProps,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { useId, useState } from "react";

interface VolumeProps extends Omit<SVGMotionProps<SVGSVGElement>, "animate"> {
  /**
   * Whether to trigger the mute animation.
   * @default false
   */
  animate?: boolean;
  /**
   * Play the animation when the icon is hovered.
   * @default false
   */
  animateOnHover?: boolean;
  /**
   * Any valid CSS color, mapped to SVG strokes/fills.
   * @default "currentColor"
   */
  color?: string;
  /**
   * Repeat the animation indefinitely.
   * @default false
   */
  loop?: boolean;
  /**
   * Convenience controlled state for mute.
   */
  muted?: boolean;
  /**
   * Icon size in pixels (applied to both width and height).
   * @default 24
   */
  size?: number | string;
}

function Volume({
  size = 24,
  color = "currentColor",
  animate = false,
  muted,
  loop = false,
  animateOnHover = false,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}: VolumeProps) {
  const reactId = useId();
  const maskId = `volume-mask-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const isMuted =
    (muted === undefined ? animate : muted) || (animateOnHover && isHovered);

  const slashTransition: Transition = reducedMotion
    ? { duration: 0 }
    : {
        pathLength: {
          ease: "easeInOut",
          duration: isMuted ? 0.22 : 0.15,
          delay: isMuted ? 0.06 : 0,
        },
        opacity: {
          ease: "easeOut",
          duration: isMuted ? 0.05 : 0.15,
          delay: isMuted ? 0.06 : 0,
        },
        ...(loop && {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          repeatDelay: 0.6,
        }),
      };

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
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <mask id={maskId}>
          <rect fill="white" height="24" width="24" />
          <g transform="rotate(-40 12 12)">
            <motion.path
              animate={{
                pathLength: isMuted ? 1 : 0,
                opacity: isMuted ? 1 : 0,
              }}
              d="M12 3 L12 21"
              initial={{ opacity: 0, pathLength: 0 }}
              stroke="black"
              strokeLinecap="round"
              strokeWidth={3.5}
              transition={slashTransition}
            />
          </g>
        </mask>
      </defs>

      <motion.g
        animate={{
          rotate: isMuted && !reducedMotion ? [0, -15, 5, -2, 0] : 0,
        }}
        initial={false}
        mask={`url(#${maskId})`}
        style={{ transformOrigin: "12px 12px" }}
        transition={{
          duration: 0.35,
          ease: "easeInOut",
        }}
      >
        <path
          d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
          fill={color}
          stroke="none"
        />

        <path
          d="M16 9a5 5 0 0 1 0 6"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
        <path
          d="M19.364 18.364a9 9 0 0 0 0-12.728"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </motion.g>

      <g transform="rotate(-40 12 12)">
        <motion.path
          animate={{
            pathLength: isMuted ? 1 : 0,
            opacity: isMuted ? 1 : 0,
          }}
          d="M12 3 L12 21"
          initial={{ opacity: 0, pathLength: 0 }}
          stroke={color}
          strokeLinecap="round"
          strokeWidth={1.5}
          transition={slashTransition}
        />
      </g>
    </motion.svg>
  );
}

export {
  Volume,
  Volume as VolumeIcon,
  type VolumeProps,
  type VolumeProps as VolumeIconProps,
};
