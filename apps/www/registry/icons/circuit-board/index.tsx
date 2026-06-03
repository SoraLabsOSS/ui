"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CircuitBoardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    path1: {
      initial: { pathLength: 1, opacity: 1, pathOffset: 0 },
      animate: {
        pathLength: [0.05, 1],
        pathOffset: [1, 0],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    circle1: {},
    path2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0.05, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    circle2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CircuitBoardProps) {
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
      <motion.rect
        animate={controls}
        height="18"
        initial="initial"
        rx="2"
        variants={variants.rect}
        width="18"
        x="3"
        y="3"
      />
      <motion.path
        animate={controls}
        d="M11 9h4a2 2 0 0 0 2-2V3"
        initial="initial"
        variants={variants.path1}
      />
      <motion.circle
        animate={controls}
        cx="9"
        cy="9"
        initial="initial"
        r="2"
        variants={variants.circle1}
      />
      <motion.path
        animate={controls}
        d="M7 21v-4a2 2 0 0 1 2-2h4"
        initial="initial"
        variants={variants.path2}
      />
      <motion.circle
        animate={controls}
        cx="15"
        cy="15"
        initial="initial"
        r="2"
        variants={variants.circle2}
      />
    </motion.svg>
  );
}

function CircuitBoard(props: CircuitBoardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CircuitBoard,
  CircuitBoard as CircuitBoardIcon,
  type CircuitBoardProps,
  type CircuitBoardProps as CircuitBoardIconProps,
};
