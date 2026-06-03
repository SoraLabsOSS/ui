"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PickaxeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 25, -5, 0],
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PickaxeProps) {
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
        d="M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M19.686 8.314a12.501 12.501 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.319"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function Pickaxe(props: PickaxeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Pickaxe,
  Pickaxe as PickaxeIcon,
  type PickaxeProps,
  type PickaxeProps as PickaxeIconProps,
};
