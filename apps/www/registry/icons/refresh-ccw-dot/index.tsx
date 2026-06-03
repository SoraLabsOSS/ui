"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type RefreshCcwProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: "spring", stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        transition: { type: "spring", stiffness: 150, damping: 25 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    circle: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: "spring", stiffness: 100, damping: 25 },
      },
      animate: {
        rotate: -360,
        transition: { type: "spring", stiffness: 100, damping: 25 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RefreshCcwProps) {
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
        d="M21 12A9 9 0 0 0 6 5.3L3 8"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M3 2v6h6"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M3 12a9 9 0 0 0 15 6.7l3-2.7"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M21 22v-6h-6"
        initial="initial"
        variants={variants.path4}
      />
      <motion.circle
        animate={controls}
        cx="12"
        cy="12"
        initial="initial"
        r="1"
        variants={variants.circle}
      />
    </motion.svg>
  );
}

function RefreshCcw(props: RefreshCcwProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RefreshCcw,
  RefreshCcw as RefreshCcwIcon,
  type RefreshCcwProps,
  type RefreshCcwProps as RefreshCcwIconProps,
};
