"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type RefreshCwOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, "-7%", "7%", "-7%", "7%", 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RefreshCwOffProps) {
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
        d="M21 8L18.74 5.74A9.75 9.75 0 0 0 12 3C11 3 10.03 3.16 9.13 3.47"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M8 16H3v5"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M3 12C3 9.51 4 7.26 5.64 5.64"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="m3 16 2.26 2.26A9.75 9.75 0 0 0 12 21c2.49 0 4.74-1 6.36-2.64"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M21 12c0 1-.16 1.97-.47 2.87"
        initial="initial"
        variants={variants.path5}
      />
      <motion.path
        animate={controls}
        d="M21 3v5h-5"
        initial="initial"
        variants={variants.path6}
      />
      <motion.path
        animate={controls}
        d="m2 2 20 20"
        initial="initial"
        variants={variants.path7}
      />
    </motion.svg>
  );
}

function RefreshCwOff(props: RefreshCwOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RefreshCwOff,
  RefreshCwOff as RefreshCwOffIcon,
  type RefreshCwOffProps,
  type RefreshCwOffProps as RefreshCwOffIconProps,
};
