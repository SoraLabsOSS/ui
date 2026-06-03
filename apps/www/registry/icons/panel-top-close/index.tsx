"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PanelTopCloseProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 3, y1: 9, x2: 21, y2: 9 },
      animate: {
        x1: 3,
        y1: 7,
        x2: 21,
        y2: 7,
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

function IconComponent({ size, ...props }: PanelTopCloseProps) {
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
        y1={9}
        y2={9}
      />
      <motion.path
        animate={controls}
        d="m9 16 3-3 3 3"
        initial="initial"
        variants={variants.arrow}
      />
    </motion.svg>
  );
}

function PanelTopClose(props: PanelTopCloseProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PanelTopClose,
  PanelTopClose as PanelTopCloseIcon,
  type PanelTopCloseProps,
  type PanelTopCloseProps as PanelTopCloseIconProps,
};
