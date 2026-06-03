"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageCircleCodeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 8, -8, 2, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path1: {},
    path2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -1.5, 0.75, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
    path3: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1.5, -0.75, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageCircleCodeProps) {
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
          d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M10 9.5 8 12l2 2.5"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="m14 9.5 2 2.5-2 2.5"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageCircleCode(props: MessageCircleCodeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageCircleCode,
  MessageCircleCode as MessageCircleCodeIcon,
  type MessageCircleCodeProps,
  type MessageCircleCodeProps as MessageCircleCodeIconProps,
};
