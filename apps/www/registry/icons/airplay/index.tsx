"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type AirplayProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {
      initial: {
        y: 0,
        transition: { duration: 0.4, ease: "easeInOut" },
      },
      animate: {
        y: 2,
        transition: { duration: 0.4, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    path1: {},
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 2, -2, 0],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AirplayProps) {
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
        d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m12 15 5 6H7Z"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function Airplay(props: AirplayProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Airplay,
  Airplay as AirplayIcon,
  type AirplayProps,
  type AirplayProps as AirplayIconProps,
  animations,
};
