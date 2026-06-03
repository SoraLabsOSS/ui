"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BrushProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { duration: 0.6, ease: "easeInOut" },
      },
      animate: {
        rotate: [0, -6, 6, 0],
        transformOrigin: "top right",
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BrushProps) {
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
        d="m11 10 3 3"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function Brush(props: BrushProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Brush,
  Brush as BrushIcon,
  type BrushProps,
  type BrushProps as BrushIconProps,
};
