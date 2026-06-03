"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type GavelProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 30, -5, 0],
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GavelProps) {
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
        d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m16 16 6-6"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="m8 8 6-6"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="m9 7 8 8"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="m21 11-8-8"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function Gavel(props: GavelProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Gavel,
  Gavel as GavelIcon,
  type GavelProps,
  type GavelProps as GavelIconProps,
};
