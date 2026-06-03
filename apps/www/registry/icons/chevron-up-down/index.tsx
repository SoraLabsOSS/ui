"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ChevronUpDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        y: 3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path2: {
      initial: {
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        y: -3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChevronUpDownProps) {
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
        d="m7 15 5 5 5-5"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m7 9 5-5 5 5"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function ChevronUpDown(props: ChevronUpDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChevronUpDown,
  ChevronUpDown as ChevronUpDownIcon,
  type ChevronUpDownProps,
  type ChevronUpDownProps as ChevronUpDownIconProps,
};
