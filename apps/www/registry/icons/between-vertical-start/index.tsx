"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BetweenVerticalStartProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    leftRect: {
      initial: {
        x: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        x: -2,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    rightRect: {
      initial: {
        x: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        x: 2,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        y: 3,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    leftRect: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    rightRect: {
      initial: { x: 0 },
      animate: {
        x: [0, 2, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    arrow: {
      initial: { y: 0 },
      animate: {
        y: [0, 3, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BetweenVerticalStartProps) {
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
      <motion.rect
        animate={controls}
        height={13}
        initial="initial"
        rx={1}
        variants={variants.leftRect}
        width={7}
        x={3}
        y={8}
      />
      <motion.path
        animate={controls}
        d="m15 2-3 3-3-3"
        initial="initial"
        variants={variants.arrow}
      />
      <motion.rect
        animate={controls}
        height={13}
        initial="initial"
        rx={1}
        variants={variants.rightRect}
        width={7}
        x={14}
        y={8}
      />
    </motion.svg>
  );
}

function BetweenVerticalStart(props: BetweenVerticalStartProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BetweenVerticalStart,
  BetweenVerticalStart as BetweenVerticalStartIcon,
  type BetweenVerticalStartProps,
  type BetweenVerticalStartProps as BetweenVerticalStartIconProps,
};
