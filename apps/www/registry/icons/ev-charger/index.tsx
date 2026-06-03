"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type EvChargerProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: EvChargerProps) {
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
        d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M2 21h13"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M3 7h11"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="m9 11-2 3h3l-2 3"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function EvCharger(props: EvChargerProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  EvCharger,
  EvCharger as EvChargerIcon,
  type EvChargerProps,
  type EvChargerProps as EvChargerIconProps,
};
