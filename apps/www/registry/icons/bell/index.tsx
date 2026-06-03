"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BellProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 20, -10, 10, -5, 3, 0],
        transformOrigin: "top center",
        transition: { duration: 0.9, ease: "easeInOut" },
      },
    },
    path1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -6, 5, -5, 4, -3, 2, 0],
        transition: { duration: 1.1, ease: "easeInOut" },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BellProps) {
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
        d="M10.268 21a2 2 0 0 0 3.464 0"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function Bell(props: BellProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Bell,
  Bell as BellIcon,
  type BellProps,
  type BellProps as BellIconProps,
};
