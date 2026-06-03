"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ChartSplineProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0.05, 1],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    path1: {},
    path2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0.05, 1],
        transition: {
          duration: 1.6,
          ease: "easeInOut",
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChartSplineProps) {
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
        d="M3 3v16a2 2 0 0 0 2 2h16"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function ChartSpline(props: ChartSplineProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChartSpline,
  ChartSpline as ChartSplineIcon,
  type ChartSplineProps,
  type ChartSplineProps as ChartSplineIconProps,
};
