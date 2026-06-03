"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type TimerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: "easeInOut", duration: 0.6 },
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: 360,
        transition: { ease: "easeInOut", duration: 0.6, delay: 0.15 },
      },
    },
    line2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 1.5, 0],
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TimerProps) {
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
      <motion.circle
        animate={controls}
        cx={12}
        cy={14}
        initial="initial"
        r={8}
        variants={variants.circle}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1={12}
        x2={15}
        y1={14}
        y2={11}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={10}
        x2={14}
        y1={2}
        y2={2}
      />
    </motion.svg>
  );
}

function Timer(props: TimerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Timer,
  Timer as TimerIcon,
  type TimerProps,
  type TimerProps as TimerIconProps,
};
