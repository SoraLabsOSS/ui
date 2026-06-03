"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MenuProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        rotate: 0,
        x: 0,
        y: 0,
      },
      animate: {
        rotate: -45,
        x: -2.35,
        y: 0.35,
        transformOrigin: "top right",
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
        },
      },
    },
    line2: {
      initial: {
        opacity: 1,
      },
      animate: {
        opacity: 0,
        transition: {
          ease: "easeInOut",
          duration: 0.2,
        },
      },
    },
    line3: {
      initial: {
        rotate: 0,
        x: 0,
        y: 0,
      },
      animate: {
        rotate: 45,
        x: -2.35,
        y: -0.35,
        transformOrigin: "bottom right",
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MenuProps) {
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
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1={4}
        x2={20}
        y1={6}
        y2={6}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={4}
        x2={20}
        y1={12}
        y2={12}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1={4}
        x2={20}
        y1={18}
        y2={18}
      />
    </motion.svg>
  );
}

function Menu(props: MenuProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Menu,
  Menu as MenuIcon,
  type MenuProps,
  type MenuProps as MenuIconProps,
};
