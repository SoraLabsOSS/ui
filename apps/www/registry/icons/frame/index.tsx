"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type FrameProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        y: 0,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
      animate: {
        y: -4,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
    },
    line2: {
      initial: {
        y: 0,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
      animate: {
        y: 4,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
    },
    line3: {
      initial: {
        x: 0,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
      animate: {
        x: -4,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
    },
    line4: {
      initial: {
        x: 0,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
      animate: {
        x: 4,
        transition: { type: "spring", stiffness: 150, damping: 15 },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    line1: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.8 },
      },
      animate: {
        y: [0, -4, 0],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line2: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.8 },
      },
      animate: {
        y: [0, 4, 0],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line3: {
      initial: {
        x: 0,
        transition: { ease: "easeInOut", duration: 0.8 },
      },
      animate: {
        x: [0, -4, 0],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line4: {
      initial: {
        x: 0,
        transition: { ease: "easeInOut", duration: 0.8 },
      },
      animate: {
        x: [0, 4, 0],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FrameProps) {
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
        x1="22"
        x2="2"
        y1="6"
        y2="6"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1="22"
        x2="2"
        y1="18"
        y2="18"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1="6"
        x2="6"
        y1="2"
        y2="22"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line4}
        x1="18"
        x2="18"
        y1="2"
        y2="22"
      />
    </motion.svg>
  );
}

function Frame(props: FrameProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Frame,
  Frame as FrameIcon,
  type FrameProps,
  type FrameProps as FrameIconProps,
};
