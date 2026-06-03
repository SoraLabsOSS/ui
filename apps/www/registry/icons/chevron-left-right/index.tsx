"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ChevronLeftRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: -3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path2: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    path1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChevronLeftRightProps) {
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
      <motion.path
        animate={controls}
        d="m9 7-5 5 5 5"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m15 7 5 5-5 5"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function ChevronLeftRight(props: ChevronLeftRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChevronLeftRight,
  ChevronLeftRight as ChevronLeftRightIcon,
  type ChevronLeftRightProps,
  type ChevronLeftRightProps as ChevronLeftRightIconProps,
};
