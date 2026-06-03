"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type EqualNotProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          opacity: { duration: 0.1 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 1.2, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  "to-not": {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 0,
        opacity: 0,
      },
      animate: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          opacity: { duration: 0.1 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EqualNotProps) {
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
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1="5"
        x2="19"
        y1="9"
        y2="9"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1="5"
        x2="19"
        y1="15"
        y2="15"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1="19"
        x2="5"
        y1="5"
        y2="19"
      />
    </motion.svg>
  );
}

function EqualNot(props: EqualNotProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EqualNot,
  EqualNot as EqualNotIcon,
  type EqualNotProps,
  type EqualNotProps as EqualNotIconProps,
};
