"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type Trash2Props = IconProps<keyof typeof animations>;

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
    line1: {
      initial: {
        y: 0,
      },
      animate: {
        y: 1,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
    line2: {
      initial: {
        y: 0,
      },
      animate: {
        y: 1,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Trash2Props) {
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
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1={10}
        x2={10}
        y1={11}
        y2={17}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={14}
        x2={14}
        y1={11}
        y2={17}
      />
    </motion.svg>
  );
}

function Trash2(props: Trash2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Trash2,
  Trash2 as Trash2Icon,
  type Trash2Props,
  type Trash2Props as Trash2IconProps,
};
