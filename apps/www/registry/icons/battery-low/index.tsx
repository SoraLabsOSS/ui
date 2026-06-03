"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BatteryLowProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line1: {},
    line2: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.3,
            ease: "easeInOut",
            repeat: 1,
            repeatType: "reverse",
            repeatDelay: 0,
          },
          scale: {
            duration: 0.3,
            ease: "easeInOut",
            repeat: 1,
            repeatType: "reverse",
            repeatDelay: 0,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BatteryLowProps) {
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
        height={10}
        initial="initial"
        rx={2}
        ry={2}
        variants={variants.rect}
        width={16}
        x={2}
        y={7}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1={22}
        x2={22}
        y1={11}
        y2={13}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={6}
        x2={6}
        y1={11}
        y2={13}
      />
    </motion.svg>
  );
}

function BatteryLow(props: BatteryLowProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BatteryLow,
  BatteryLow as BatteryLowIcon,
  type BatteryLowProps,
  type BatteryLowProps as BatteryLowIconProps,
};
