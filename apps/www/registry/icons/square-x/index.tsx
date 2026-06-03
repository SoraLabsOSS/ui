"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SquareXProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
      animate: {
        rotate: 90,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: "easeInOut", duration: 0.4, delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { ease: "easeInOut", duration: 0.4, delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareXProps) {
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
        height={18}
        initial="initial"
        rx={2}
        ry={2}
        variants={variants.rect}
        width={18}
        x={3}
        y={3}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1={9}
        x2={15}
        y1={15}
        y2={9}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={9}
        x2={15}
        y1={9}
        y2={15}
      />
    </motion.svg>
  );
}

function SquareX(props: SquareXProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareX,
  SquareX as SquareXIcon,
  type SquareXProps,
  type SquareXProps as SquareXIconProps,
};
