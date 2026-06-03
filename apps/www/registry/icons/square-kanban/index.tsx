"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SquareKanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line1: {
      initial: {
        y2: 16,
      },
      animate: {
        y2: [16, 11, 14, 16],
        transition: { duration: 0.6, ease: "linear" },
      },
    },
    line2: {
      initial: {
        y2: 11,
      },
      animate: {
        y2: [11, 14, 16, 11],
        transition: { duration: 0.6, ease: "linear" },
      },
    },
    line3: {
      initial: {
        y2: 14,
      },
      animate: {
        y2: [14, 16, 11, 14],
        transition: { duration: 0.6, ease: "linear" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareKanbanProps) {
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
        x1={16}
        x2={16}
        y1={7}
        y2={16}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={12}
        x2={12}
        y1={7}
        y2={11}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1={8}
        x2={8}
        y1={7}
        y2={14}
      />
    </motion.svg>
  );
}

function SquareKanban(props: SquareKanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareKanban,
  SquareKanban as SquareKanbanIcon,
  type SquareKanbanProps,
  type SquareKanbanProps as SquareKanbanIconProps,
};
