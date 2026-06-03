"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BinaryProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: -8,
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    },
    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: 8,
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    },
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: -10,
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: 10,
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BinaryProps) {
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
      <motion.rect
        animate={controls}
        height={6}
        initial="initial"
        rx={2}
        variants={variants.rect1}
        width={4}
        x={14}
        y={14}
      />
      <motion.rect
        animate={controls}
        height={6}
        initial="initial"
        rx={2}
        variants={variants.rect2}
        width={4}
        x={6}
        y={4}
      />
      <motion.path
        animate={controls}
        d="M6 20h4 M6 14h2v6"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M14 4h2v6 M14 10h4"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function Binary(props: BinaryProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Binary,
  Binary as BinaryIcon,
  type BinaryProps,
  type BinaryProps as BinaryIconProps,
};
