"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PaperclipProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [0.02, 1],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    path: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.02, 1],
        transition: {
          duration: 2.4,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PaperclipProps) {
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
        d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"
        initial="initial"
        variants={variants.path}
      />
    </motion.svg>
  );
}

function Paperclip(props: PaperclipProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Paperclip,
  Paperclip as PaperclipIcon,
  type PaperclipProps,
  type PaperclipProps as PaperclipIconProps,
};
