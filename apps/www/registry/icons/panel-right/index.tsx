"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PanelRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 15, y1: 3, x2: 15, y2: 21 },
      animate: {
        x1: 17,
        y1: 3,
        x2: 17,
        y2: 21,
        transition: { type: "spring", damping: 18, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PanelRightProps) {
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
        x1={15}
        x2={15}
        y1={3}
        y2={21}
      />
    </motion.svg>
  );
}

function PanelRight(props: PanelRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PanelRight,
  PanelRight as PanelRightIcon,
  type PanelRightProps,
  type PanelRightProps as PanelRightIconProps,
};
