"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BadgeCheckProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.9, 1],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    path2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [1, 0, 1],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  check: {
    path2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BadgeCheckProps) {
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
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m9 12 2 2 4-4"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function BadgeCheck(props: BadgeCheckProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BadgeCheck,
  BadgeCheck as BadgeCheckIcon,
  type BadgeCheckProps,
  type BadgeCheckProps as BadgeCheckIconProps,
};
