"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type RotateCwProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: "spring", stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: 45,
        transition: { type: "spring", stiffness: 150, damping: 25 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: "spring", stiffness: 100, damping: 25 },
      },
      animate: {
        rotate: 360,
        transition: { type: "spring", stiffness: 100, damping: 25 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RotateCwProps) {
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
      <motion.path
        animate={controls}
        d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M21 3v5h-5"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function RotateCw(props: RotateCwProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RotateCw,
  RotateCw as RotateCwIcon,
  type RotateCwProps,
  type RotateCwProps as RotateCwIconProps,
};
