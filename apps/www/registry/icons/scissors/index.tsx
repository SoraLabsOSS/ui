"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ScissorsProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -26, 0],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 26, 0],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ScissorsProps) {
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
      <motion.g animate={controls} initial="initial" variants={variants.group1}>
        <motion.circle
          animate={controls}
          cx="6"
          cy="6"
          initial="initial"
          r="3"
          variants={variants.circle1}
        />
        <motion.path
          animate={controls}
          d="M8.12 8.12 12 12"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M14.8 14.8 20 20"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
      <motion.g animate={controls} initial="initial" variants={variants.group2}>
        <motion.circle
          animate={controls}
          cx="6"
          cy="18"
          initial="initial"
          r="3"
          variants={variants.circle2}
        />
        <motion.path
          animate={controls}
          d="M20 4 8.12 15.88"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>
    </motion.svg>
  );
}

function Scissors(props: ScissorsProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Scissors,
  Scissors as ScissorsIcon,
  type ScissorsProps,
  type ScissorsProps as ScissorsIconProps,
};
