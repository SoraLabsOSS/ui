"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PlugZapProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PlugZapProps) {
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
        d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m2 22 3-3"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M7.5 13.5 10 11"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M10.5 16.5 13 14"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="m18 3-4 4h6l-4 4"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function PlugZap(props: PlugZapProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PlugZap,
  PlugZap as PlugZapIcon,
  type PlugZapProps,
  type PlugZapProps as PlugZapIconProps,
};
