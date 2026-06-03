"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type KanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        y2: 19,
      },
      animate: {
        y2: [19, 11, 16, 19],
        transition: { duration: 0.6, ease: "linear" },
      },
    },
    line2: {
      initial: {
        y2: 11,
      },
      animate: {
        y2: [11, 16, 19, 11],
        transition: { duration: 0.6, ease: "linear" },
      },
    },
    line3: {
      initial: {
        y2: 16,
      },
      animate: {
        y2: [16, 19, 11, 16],
        transition: { duration: 0.6, ease: "linear" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: KanbanProps) {
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
        x1={18}
        x2={18}
        y1={5}
        y2={19}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={12}
        x2={12}
        y1={5}
        y2={11}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1={6}
        x2={6}
        y1={5}
        y2={16}
      />
    </motion.svg>
  );
}

function Kanban(props: KanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Kanban,
  Kanban as KanbanIcon,
  type KanbanProps,
  type KanbanProps as KanbanIconProps,
};
