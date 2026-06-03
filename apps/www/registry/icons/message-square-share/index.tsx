"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageSquareShareProps = IconProps<keyof typeof animations>;

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
    group2: {},
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  "arrow-up": {
    group: {},
    group2: {
      initial: {
        x: 0,
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        x: 2,
        y: -2,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  "arrow-up-loop": {
    group: {},
    group2: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 2, 0],
        y: [0, -2, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareShareProps) {
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
          d="M21 12v3a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h7"
          initial="initial"
          variants={variants.path1}
        />
        <motion.g
          animate={controls}
          initial="initial"
          variants={variants.group2}
        >
          <motion.path
            animate={controls}
            d="M16 3h5v5"
            initial="initial"
            variants={variants.path2}
          />
          <motion.path
            animate={controls}
            d="m16 8 5-5"
            initial="initial"
            variants={variants.path3}
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareShare(props: MessageSquareShareProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareShare,
  MessageSquareShare as MessageSquareShareIcon,
  type MessageSquareShareProps,
  type MessageSquareShareProps as MessageSquareShareIconProps,
};
