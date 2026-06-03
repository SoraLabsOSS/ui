"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MinimizeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 2,
        y: 2,
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
        y: 2,
        x: -2,
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
        y: -2,
        x: 2,
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
        y: -2,
        x: -2,
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
        x: [0, 2, 0],
        y: [0, 2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path2: {
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
    path3: {
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
    path4: {
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
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MinimizeProps) {
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
        d="M8 3v3a2 2 0 0 1-2 2H3"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M21 8h-3a2 2 0 0 1-2-2V3"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M3 16h3a2 2 0 0 1 2 2v3"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M16 21v-3a2 2 0 0 1 2-2h3"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function Minimize(props: MinimizeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Minimize,
  Minimize as MinimizeIcon,
  type MinimizeProps,
  type MinimizeProps as MinimizeIconProps,
};
