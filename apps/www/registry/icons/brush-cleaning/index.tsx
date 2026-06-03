"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BrushCleaningProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { duration: 0.6, ease: "easeInOut" },
      },
      animate: {
        rotate: [0, -10, 10, 0],
        transformOrigin: "top center",
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BrushCleaningProps) {
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
        d="m16 22-1-4"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M19 13.99a1 1 0 0 0 1-1V12a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v.99a1 1 0 0 0 1 1"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M5 14h14l1.973 6.767A1 1 0 0 1 20 22H4a1 1 0 0 1-.973-1.233z"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="m8 22 1-4"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function BrushCleaning(props: BrushCleaningProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BrushCleaning,
  BrushCleaning as BrushCleaningIcon,
  type BrushCleaningProps,
  type BrushCleaningProps as BrushCleaningIconProps,
};
