"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ActivityProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        opacity: 1,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        pathOffset: [1, 0],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-return": {
    path: {
      initial: {
        opacity: 1,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        opacity: [0, 1, 1, 1],
        pathLength: [0, 1, 0, 1],
        pathOffset: [1, 0, 0.01, 0],
        transition: {
          duration: 2.5,
          ease: "easeInOut",
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    path: {
      initial: {
        opacity: 1,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        opacity: [0, 1, 1, 1, 1],
        pathLength: [0, 1, 0, 1, 0],
        pathOffset: [1, 0, 0.01, 0, 0.999],
        transition: {
          duration: 3,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ActivityProps) {
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
        d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
        initial="initial"
        variants={variants.path}
      />
    </motion.svg>
  );
}

function Activity(props: ActivityProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Activity,
  Activity as ActivityIcon,
  type ActivityProps,
  type ActivityProps as ActivityIconProps,
  animations,
};
