"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type RotateCcwKeyProps = IconProps<keyof typeof animations>;

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
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: "spring", stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -360,
        transition: { type: "spring", stiffness: 150, damping: 25 },
      },
    },
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RotateCcwKeyProps) {
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
        d="m14.5 9.5 1 1"
        initial="initial"
        variants={variants.keyPart1}
      />
      <motion.path
        animate={controls}
        d="m15.5 8.5-4 4"
        initial="initial"
        variants={variants.keyPart2}
      />
      <motion.path
        animate={controls}
        d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"
        initial="initial"
        variants={variants.arrowArc}
      />
      <motion.path
        animate={controls}
        d="M3 3v5h5"
        initial="initial"
        variants={variants.arrowHead}
      />
      <motion.circle
        animate={controls}
        cx="10"
        cy="14"
        initial="initial"
        r="2"
        variants={variants.circle}
      />
    </motion.svg>
  );
}

function RotateCcwKey(props: RotateCcwKeyProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  RotateCcwKey,
  RotateCcwKey as RotateCcwKeyIcon,
  type RotateCcwKeyProps,
  type RotateCcwKeyProps as RotateCcwKeyIconProps,
};
