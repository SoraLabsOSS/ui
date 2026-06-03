"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CircleCheckProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    path: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CircleCheckProps) {
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
        cx="12"
        cy="12"
        initial="initial"
        r="10"
        variants={variants.circle}
      />
      <motion.path
        animate={controls}
        d="m9 12 2 2 4-4"
        initial="initial"
        variants={variants.path}
      />
    </motion.svg>
  );
}

function CircleCheck(props: CircleCheckProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CircleCheck,
  CircleCheck as CircleCheckIcon,
  type CircleCheckProps,
  type CircleCheckProps as CircleCheckIconProps,
};
