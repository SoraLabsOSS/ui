"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SignalLowProps = IconProps<keyof typeof animations>;

const pathAnimation: Variants = {
  initial: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const animations = {
  default: {
    group: {
      initial: {},
      animate: {
        transition: {
          staggerChildren: 0.2,
        },
      },
    },
    path1: pathAnimation,
    path2: pathAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SignalLowProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      animate={controls}
      fill="none"
      height={size}
      initial="initial"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      variants={variants.group}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path d="M2 20h.01" variants={variants.path1} />
      <motion.path d="M7 20v-4" variants={variants.path2} />
    </motion.svg>
  );
}

function SignalLow(props: SignalLowProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SignalLow,
  SignalLow as SignalLowIcon,
  type SignalLowProps,
  type SignalLowProps as SignalLowIconProps,
};
