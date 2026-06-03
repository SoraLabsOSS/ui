"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SearchProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom right",
        rotate: [0, 17, -10, 5, -1, 0],
        transition: { duration: 0.8, ease: "easeInOut" },
      },
    },
    path: {},
    circle: {},
  } satisfies Record<string, Variants>,
  find: {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, "-15%", 0, 0],
        y: [0, 0, "-15%", 0],
        transition: { duration: 1, ease: "easeInOut" },
      },
    },
    path: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SearchProps) {
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
        d="m21 21-4.34-4.34"
        initial="initial"
        variants={variants.path}
      />
      <motion.circle
        animate={controls}
        cx={11}
        cy={11}
        initial="initial"
        r={8}
        variants={variants.circle}
      />
    </motion.svg>
  );
}

function Search(props: SearchProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Search,
  Search as SearchIcon,
  type SearchProps,
  type SearchProps as SearchIconProps,
};
