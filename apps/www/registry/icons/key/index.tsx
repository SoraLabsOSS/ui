"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type KeyProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        originX: "12px",
        originY: "12px",
      },
      animate: {
        rotate: [0, -20, 0],
        scale: [1, 0.95, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    stem: {},
    teeth: {},
    circle: {},
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        originX: "12px",
        originY: "12px",
      },
      animate: {
        rotate: [0, -10, 10, -10, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
    },
    stem: {},
    teeth: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: KeyProps) {
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
      <motion.g animate={controls} initial="initial" variants={variants.group}>
        <motion.path
          animate={controls}
          d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"
          initial="initial"
          variants={variants.stem}
        />
        <motion.path
          animate={controls}
          d="m21 2-9.6 9.6"
          initial="initial"
          variants={variants.teeth}
        />
        <motion.circle
          animate={controls}
          cx="7.5"
          cy="15.5"
          initial="initial"
          r="5.5"
          variants={variants.circle}
        />
      </motion.g>
    </motion.svg>
  );
}

function Key(props: KeyProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Key,
  Key as KeyIcon,
  type KeyProps,
  type KeyProps as KeyIconProps,
};
