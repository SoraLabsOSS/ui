"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SquareDashedKanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
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

function IconComponent({ size, ...props }: SquareDashedKanbanProps) {
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
        d="M5 3a2 2 0 0 0-2 2"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M9 3h1"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M14 3h1"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M19 3a2 2 0 0 1 2 2"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M21 9v1"
        initial="initial"
        variants={variants.path5}
      />
      <motion.path
        animate={controls}
        d="M21 14v1"
        initial="initial"
        variants={variants.path6}
      />
      <motion.path
        animate={controls}
        d="M21 19a2 2 0 0 1-2 2"
        initial="initial"
        variants={variants.path7}
      />
      <motion.path
        animate={controls}
        d="M14 21h1"
        initial="initial"
        variants={variants.path8}
      />
      <motion.path
        animate={controls}
        d="M9 21h1"
        initial="initial"
        variants={variants.path9}
      />
      <motion.path
        animate={controls}
        d="M5 21a2 2 0 0 1-2-2"
        initial="initial"
        variants={variants.path10}
      />
      <motion.path
        animate={controls}
        d="M3 14v1"
        initial="initial"
        variants={variants.path11}
      />
      <motion.path
        animate={controls}
        d="M3 9v1"
        initial="initial"
        variants={variants.path12}
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

function SquareDashedKanban(props: SquareDashedKanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareDashedKanban,
  SquareDashedKanban as SquareDashedKanbanIcon,
  type SquareDashedKanbanProps,
  type SquareDashedKanbanProps as SquareDashedKanbanIconProps,
};
