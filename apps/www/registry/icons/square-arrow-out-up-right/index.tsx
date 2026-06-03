"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SquareArrowOutUpRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: "easeInOut" },
      },
      animate: {
        x: 2,
        y: -2,
        transition: { duration: 0.4, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 2, 0],
        y: [0, -2, 0],
        transition: { duration: 0.8, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareArrowOutUpRightProps) {
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
        <motion.path
          animate={controls}
          d="m21 3-9 9"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M15 3h6v6"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
      <motion.path
        animate={controls}
        d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function SquareArrowOutUpRight(props: SquareArrowOutUpRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareArrowOutUpRight,
  SquareArrowOutUpRight as SquareArrowOutUpRightIcon,
  type SquareArrowOutUpRightProps,
  type SquareArrowOutUpRightProps as SquareArrowOutUpRightIconProps,
};
