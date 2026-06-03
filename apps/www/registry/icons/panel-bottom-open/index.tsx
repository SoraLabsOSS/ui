"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PanelBottomOpenProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 3, y1: 15, x2: 21, y2: 15 },
      animate: {
        x1: 3,
        y1: 13,
        x2: 21,
        y2: 13,
        transition: { type: "spring", damping: 18, stiffness: 200 },
      },
    },
    arrow: {
      initial: { y: 0 },
      animate: {
        y: -2,
        transition: { type: "spring", damping: 18, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PanelBottomOpenProps) {
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
        variants={variants.line}
        x1={3}
        x2={21}
        y1={15}
        y2={15}
      />
      <motion.path
        animate={controls}
        d="m9 10 3-3 3 3"
        initial="initial"
        variants={variants.arrow}
      />
    </motion.svg>
  );
}

function PanelBottomOpen(props: PanelBottomOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PanelBottomOpen,
  PanelBottomOpen as PanelBottomOpenIcon,
  type PanelBottomOpenProps,
  type PanelBottomOpenProps as PanelBottomOpenIconProps,
};
