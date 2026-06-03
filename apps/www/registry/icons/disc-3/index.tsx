"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type Disc3Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 1,
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

function IconComponent({ size, ...props }: Disc3Props) {
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
      <motion.circle
        animate={controls}
        cx="12"
        cy="12"
        initial="initial"
        r="10"
        variants={variants.circle1}
      />
      <motion.path
        animate={controls}
        d="M6 12c0-1.7.7-3.2 1.8-4.2"
        initial="initial"
        variants={variants.path1}
      />
      <motion.circle
        animate={controls}
        cx="12"
        cy="12"
        initial="initial"
        r="2"
        variants={variants.circle2}
      />
      <motion.path
        animate={controls}
        d="M18 12c0 1.7-.7 3.2-1.8 4.2"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function Disc3(props: Disc3Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Disc3,
  Disc3 as Disc3Icon,
  type Disc3Props,
  type Disc3Props as Disc3IconProps,
};
