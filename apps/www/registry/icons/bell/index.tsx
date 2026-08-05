"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
  useAnimateIconVariants,
} from "@/registry/icons/icon";

type BellProps = IconProps<keyof typeof animations, never>;

const RATTLE = [0, -8, 4, -2, 1, -0.5, 0.25, 0];
const RATTLE_DURATION = 0.6;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: RATTLE,
        transition: { duration: RATTLE_DURATION, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

const supportedStaticAnimations = [] as const;

const BELL_BODY =
  "M20 16.191C20 16.6378 19.6378 17 19.191 17H4.80902C4.36221 17 4 16.6378 4 16.191C4 16.0654 4.02924 15.9415 4.08541 15.8292L5.21846 13.5631C5.40413 13.1917 5.51071 12.7859 5.53144 12.3712L5.70037 8.99251C5.86822 5.63561 8.6389 3 12 3C15.3611 3 18.1318 5.63561 18.2996 8.99251L18.4686 12.3712C18.4893 12.7859 18.5959 13.1917 18.7815 13.5631L19.9146 15.8292C19.9708 15.9415 20 16.0654 20 16.191Z";
const BELL_CLAPPER =
  "M16 17C16 19.2091 14.2091 21 12 21C9.79086 21 8 19.2091 8 17";

function IconComponent({ size, color = "currentColor", ...props }: BellProps) {
  const { controls } = useAnimateIconContext();
  const variants = useAnimateIconVariants(animations);
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <motion.svg
        aria-hidden="true"
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
      <motion.g
        animate={controls}
        initial="initial"
        style={{ transformOrigin: "50% 24%" }}
        variants={variants.group}
      >
        <path d={BELL_CLAPPER} />
        <path d={BELL_BODY} strokeLinecap="square" />
      </motion.g>
    </motion.svg>
  );
}

function Bell(props: BellProps) {
  return (
    <IconWrapper<keyof typeof animations, never>
      icon={IconComponent}
      {...props}
    />
  );
}

export {
  animations,
  Bell,
  Bell as BellIcon,
  type BellProps,
  type BellProps as BellIconProps,
  supportedStaticAnimations,
};
