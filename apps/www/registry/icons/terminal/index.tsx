"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type TerminalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        opacity: 1,
      },
      animate: {
        opacity: [1, 0, 1, 0, 1],
        transition: {
          duration: 1.5,
          ease: "easeInOut",
        },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TerminalProps) {
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
        d="M12 19h8"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m4 17 6-6-6-6"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function Terminal(props: TerminalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Terminal,
  Terminal as TerminalIcon,
  type TerminalProps,
  type TerminalProps as TerminalIconProps,
};
