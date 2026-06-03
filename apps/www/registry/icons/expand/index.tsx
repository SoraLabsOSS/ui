"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ExpandProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        y: 2,
        x: 2,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    group2: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        y: -2,
        x: 2,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    group3: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        y: 2,
        x: -2,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    group4: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        y: -2,
        x: -2,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group1: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 2, 0],
        x: [0, 2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    group2: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -2, 0],
        x: [0, 2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    group3: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 2, 0],
        x: [0, -2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    group4: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -2, 0],
        x: [0, -2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ExpandProps) {
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
        <motion.path
          animate={controls}
          d="m15 15 6 6"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M21 16v5h-5"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>
      <motion.g animate={controls} initial="initial" variants={variants.group2}>
        <motion.path
          animate={controls}
          d="m15 9 6-6"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M21 8V3h-5"
          initial="initial"
          variants={variants.path4}
        />
      </motion.g>
      <motion.g animate={controls} initial="initial" variants={variants.group3}>
        <motion.path
          animate={controls}
          d="M3 16v5h5"
          initial="initial"
          variants={variants.path5}
        />
        <motion.path
          animate={controls}
          d="m3 21 6-6"
          initial="initial"
          variants={variants.path6}
        />
      </motion.g>
      <motion.g animate={controls} initial="initial" variants={variants.group4}>
        <motion.path
          animate={controls}
          d="M3 8V3h5"
          initial="initial"
          variants={variants.path7}
        />
        <motion.path
          animate={controls}
          d="M9 9 3 3"
          initial="initial"
          variants={variants.path8}
        />
      </motion.g>
    </motion.svg>
  );
}

function Expand(props: ExpandProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Expand,
  Expand as ExpandIcon,
  type ExpandProps,
  type ExpandProps as ExpandIconProps,
};
