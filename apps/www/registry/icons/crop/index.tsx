"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CropProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        pathLength: [1, 0.8, 1],
        pathOffset: [0, 0.1, 0],
        x: [0, 3, 0],
        y: [0, -3, 0],
        transition: {
          duration: 1,
          ease: "easeInOut",
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        pathLength: [1, 0.8, 1],
        pathOffset: [0, 0.1, 0],
        x: [0, -3, 0],
        y: [0, 3, 0],
        transition: {
          duration: 1,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CropProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      animate={controls}
      fill="none"
      height={size}
      initial="initial"
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
        d="M6 2v14a2 2 0 0 0 2 2h14"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M18 22V8a2 2 0 0 0-2-2H2"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function Crop(props: CropProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Crop,
  Crop as CropIcon,
  type CropProps,
  type CropProps as CropIconProps,
};
