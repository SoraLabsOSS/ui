"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ArrowUpDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    upArrowGroup: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        y: -3,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        y: 3,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    upArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -3, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 3, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
  out: {
    upArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -24, 24, 0],
        transition: {
          default: { ease: "easeInOut", duration: 0.6 },
          y: {
            ease: "easeInOut",
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 24, -24, 0],
        transition: {
          default: { ease: "easeInOut", duration: 0.6 },
          y: {
            ease: "easeInOut",
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArrowUpDownProps) {
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
      {/* Right Arrow (Down) */}
      <motion.g
        animate={controls}
        initial="initial"
        variants={variants.downArrowGroup}
      >
        <motion.path
          animate={controls}
          d="m21 16-4 4-4-4"
          initial="initial"
          variants={variants.downArrowHead}
        />
        <motion.path
          animate={controls}
          d="M17 20V4"
          initial="initial"
          variants={variants.downArrowLine}
        />
      </motion.g>
      {/* Left Arrow (Up) */}
      <motion.g
        animate={controls}
        initial="initial"
        variants={variants.upArrowGroup}
      >
        <motion.path
          animate={controls}
          d="m3 8 4-4 4 4"
          initial="initial"
          variants={variants.upArrowHead}
        />
        <motion.path
          animate={controls}
          d="M7 4v16"
          initial="initial"
          variants={variants.upArrowLine}
        />
      </motion.g>
    </motion.svg>
  );
}

function ArrowUpDown(props: ArrowUpDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  ArrowUpDown,
  ArrowUpDown as ArrowUpDownIcon,
  type ArrowUpDownProps,
  type ArrowUpDownProps as ArrowUpDownIconProps,
  animations,
};
