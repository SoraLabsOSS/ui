"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type TimerOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, "-7%", "7%", "-7%", "7%", 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path5: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TimerOffProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      animate={controls}
      fill="none"
      height={size}
      initial="initial"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      variants={variants.group}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        animate={controls}
        d="M10 2h4"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="m2 2 20 20"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M12 12v-2"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function TimerOff(props: TimerOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  TimerOff,
  TimerOff as TimerOffIcon,
  type TimerOffProps,
  type TimerOffProps as TimerOffIconProps,
};
