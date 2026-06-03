"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageSquareWarningProps = IconProps<keyof typeof animations>;

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
        y: 0,
      },
      animate: {
        y: [0, 1, -0.25, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.8,
          times: [0, 0.4, 0.7, 1],
        },
      },
    },
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareWarningProps) {
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
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M12 7v2"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M12 13h.01"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareWarning(props: MessageSquareWarningProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareWarning,
  MessageSquareWarning as MessageSquareWarningIcon,
  type MessageSquareWarningProps,
  type MessageSquareWarningProps as MessageSquareWarningIconProps,
};
