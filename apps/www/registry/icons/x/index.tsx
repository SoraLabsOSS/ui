"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type XProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
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
  plus: {
    line1: {
      initial: {
        rotate: 0,
        x1: 6,
        y1: 18,
        x2: 18,
        y2: 6,
        transition: { ease: "easeInOut", duration: 0.3, delay: 0.1 },
      },
      animate: {
        rotate: 45,
        x1: 7.1,
        y1: 16.9,
        x2: 16.9,
        y2: 7.1,
        transition: { ease: "easeInOut", duration: 0.3, delay: 0.1 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        x1: 6,
        y1: 6,
        x2: 18,
        y2: 18,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        rotate: 45,
        x1: 7.1,
        y1: 7.1,
        x2: 16.9,
        y2: 16.9,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: XProps) {
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
        x1={6}
        x2={18}
        y1={18}
        y2={6}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={6}
        x2={18}
        y1={6}
        y2={18}
      />
    </motion.svg>
  );
}

function X(props: XProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { animations, X, X as XIcon, type XProps, type XProps as XIconProps };
