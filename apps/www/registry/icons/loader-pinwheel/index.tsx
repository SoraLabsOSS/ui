"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type LoaderPinwheelProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: 360,
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    circle: {},
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LoaderPinwheelProps) {
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
      <motion.g animate={controls} initial="initial" variants={variants.group}>
        <motion.circle
          animate={controls}
          cx={12}
          cy={12}
          initial="initial"
          r={10}
          variants={variants.circle}
        />
        <motion.path
          animate={controls}
          d="M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>
    </motion.svg>
  );
}

function LoaderPinwheel(props: LoaderPinwheelProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LoaderPinwheel,
  LoaderPinwheel as LoaderPinwheelIcon,
  type LoaderPinwheelProps,
  type LoaderPinwheelProps as LoaderPinwheelIconProps,
};
