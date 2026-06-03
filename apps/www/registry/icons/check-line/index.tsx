"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CheckLineProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CheckLineProps) {
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
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        animate={controls}
        d="m4 10 5 5L20 4"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M21,19H3"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function CheckLine(props: CheckLineProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CheckLine,
  CheckLine as CheckLineIcon,
  type CheckLineProps,
  type CheckLineProps as CheckLineIconProps,
};
