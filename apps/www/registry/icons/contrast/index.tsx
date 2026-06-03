"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ContrastProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: 180,
        transformOrigin: "left center",
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 10,
        },
      },
    },
  } satisfies Record<string, Variants>,
  rotate: {
    circle: {},
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transformOrigin: "left center",
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 10,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ContrastProps) {
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
      <motion.circle
        animate={controls}
        cx={12}
        cy={12}
        initial="initial"
        r={10}
        variants={variants.circle}
      />
      <motion.path
        animate={controls}
        d="M12 18a6 6 0 0 0 0-12v12z"
        initial="initial"
        variants={variants.path}
      />
    </motion.svg>
  );
}

function Contrast(props: ContrastProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Contrast,
  Contrast as ContrastIcon,
  type ContrastProps,
  type ContrastProps as ContrastIconProps,
};
