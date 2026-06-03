"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type LogInProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 2,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LogInProps) {
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
          d="m10 17 5-5-5-5"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M15 12H3"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
      <motion.path
        animate={controls}
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function LogIn(props: LogInProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LogIn,
  LogIn as LogInIcon,
  type LogInProps,
  type LogInProps as LogInIconProps,
};
