"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type OrbitProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: OrbitProps) {
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
        d="M20.341 6.484A10 10 0 0 1 10.266 21.85"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M3.659 17.516A10 10 0 0 1 13.74 2.152"
        initial="initial"
        variants={variants.path2}
      />
      <motion.circle
        animate={controls}
        cx="12"
        cy="12"
        initial="initial"
        r="3"
        variants={variants.circle1}
      />
      <motion.circle
        animate={controls}
        cx="19"
        cy="5"
        initial="initial"
        r="2"
        variants={variants.circle2}
      />
      <motion.circle
        animate={controls}
        cx="5"
        cy="19"
        initial="initial"
        r="2"
        variants={variants.circle3}
      />
    </motion.svg>
  );
}

function Orbit(props: OrbitProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Orbit,
  Orbit as OrbitIcon,
  type OrbitProps,
  type OrbitProps as OrbitIconProps,
};
