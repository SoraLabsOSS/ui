"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MaximizeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: -2,
        y: -2,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path2: {
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
    path3: {
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
    path4: {
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
  } satisfies Record<string, Variants>,
  "default-loop": {
    path1: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -2, 0],
        y: [0, -2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path2: {
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
    path3: {
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
    path4: {
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
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MaximizeProps) {
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
        d="M8 3H5a2 2 0 0 0-2 2v3"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M21 8V5a2 2 0 0 0-2-2h-3"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M3 16v3a2 2 0 0 0 2 2h3"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M16 21h3a2 2 0 0 0 2-2v-3"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function Maximize(props: MaximizeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Maximize,
  Maximize as MaximizeIcon,
  type MaximizeProps,
  type MaximizeProps as MaximizeIconProps,
};
