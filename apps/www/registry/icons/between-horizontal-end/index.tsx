"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BetweenHorizontalEndProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    topRect: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        y: -2,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    bottomRect: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        y: 2,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        x: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        x: -3,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    topRect: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    bottomRect: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: [0, -3, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BetweenHorizontalEndProps) {
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
        height={7}
        initial="initial"
        rx={1}
        variants={variants.topRect}
        width={13}
        x={3}
        y={3}
      />
      <motion.path
        animate={controls}
        d="m22 15-3-3 3-3"
        initial="initial"
        variants={variants.arrow}
      />
      <motion.rect
        animate={controls}
        height={7}
        initial="initial"
        rx={1}
        variants={variants.bottomRect}
        width={13}
        x={3}
        y={14}
      />
    </motion.svg>
  );
}

function BetweenHorizontalEnd(props: BetweenHorizontalEndProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BetweenHorizontalEnd,
  BetweenHorizontalEnd as BetweenHorizontalEndIcon,
  type BetweenHorizontalEndProps,
  type BetweenHorizontalEndProps as BetweenHorizontalEndIconProps,
};
