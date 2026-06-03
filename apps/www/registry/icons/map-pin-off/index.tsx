"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MapPinOffProps = IconProps<keyof typeof animations>;

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
    path3: {
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
    path4: {},
    path5: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MapPinOffProps) {
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
        d="M12.75 7.09a3 3 0 0 1 2.16 2.16"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M17.072 17.072c-1.634 2.17-3.527 3.912-4.471 4.727a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 1.432-4.568"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="m2 2 20 20"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M8.475 2.818A8 8 0 0 1 20 10c0 1.183-.31 2.377-.81 3.533"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M9.13 9.13a3 3 0 0 0 3.74 3.74"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function MapPinOff(props: MapPinOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MapPinOff,
  MapPinOff as MapPinOffIcon,
  type MapPinOffProps,
  type MapPinOffProps as MapPinOffIconProps,
};
