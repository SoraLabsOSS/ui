"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type RouteProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle1: {},
    circle2: {},
    path: {
      initial: {
        opacity: 1,
        pathLength: 1,
      },
      animate: {
        opacity: [0, 1],
        pathLength: [0.05, 1],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          opacity: {
            duration: 0.01,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    circle1: {},
    circle2: {},
    path: {
      initial: {
        opacity: 1,
        pathLength: 1,
      },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0.05, 1],
        transition: {
          duration: 1.6,
          ease: "easeInOut",
          opacity: {
            duration: 0.01,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RouteProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.circle
        animate={controls}
        cx="6"
        cy="19"
        initial="initial"
        r="3"
        variants={variants.circle1}
      />
      <motion.path
        animate={controls}
        d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"
        initial="initial"
        variants={variants.path}
      />
      <motion.circle
        animate={controls}
        cx="18"
        cy="5"
        initial="initial"
        r="3"
        variants={variants.circle2}
      />
    </motion.svg>
  );
}

function Route(props: RouteProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Route,
  Route as RouteIcon,
  type RouteProps,
  type RouteProps as RouteIconProps,
};
