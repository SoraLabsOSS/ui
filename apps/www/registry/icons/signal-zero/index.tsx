"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SignalZeroProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SignalZeroProps) {
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
        d="M2 20h.01"
        initial="initial"
        variants={variants.path1}
      />
    </motion.svg>
  );
}

function SignalZero(props: SignalZeroProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SignalZero,
  SignalZero as SignalZeroIcon,
  type SignalZeroProps,
  type SignalZeroProps as SignalZeroIconProps,
};
