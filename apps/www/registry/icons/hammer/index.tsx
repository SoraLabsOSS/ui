"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type HammerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 30, -5, 0],
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: HammerProps) {
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
        d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m18 15 4-4"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function Hammer(props: HammerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Hammer,
  Hammer as HammerIcon,
  type HammerProps,
  type HammerProps as HammerIconProps,
};
