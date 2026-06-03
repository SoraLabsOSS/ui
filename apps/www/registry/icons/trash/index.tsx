"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type TrashProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        y: 0,
      },
      animate: {
        y: -1,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: {
        y: 0,
        d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
      },
      animate: {
        y: 1,
        d: "M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8",
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TrashProps) {
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
          d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M3 6h18"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
      <motion.path
        animate={controls}
        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function Trash(props: TrashProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Trash,
  Trash as TrashIcon,
  type TrashProps,
  type TrashProps as TrashIconProps,
};
