"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PartyPopperProps = IconProps<keyof typeof animations>;

const popperAnimation: Variants = {
  initial: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    scale: 1,
    x: 0,
    y: 0,
  },
  animate: {
    opacity: [0, 0, 0, 1, 1],
    scale: [0.3, 0.8, 1, 1.1, 1],
    pathLength: [0, 0.5, 1],
    pathOffset: [1, 0.5, 0],
    x: [-5, 0],
    y: [5, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [-1, 1, 0],
        y: [1, -1, 0],
        scale: [1, 0.7, 1.1, 1],
        transformOrigin: "bottom left",
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: {
        opacity: [0, 0, 0, 1, 1],
        x: [-5, 0],
        y: [5, 0],
        scale: [0.5, 1, 1.2, 1],
        transition: {
          duration: 0.6,
        },
      },
    },
    path4: {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: {
        opacity: [0, 0, 0, 1, 1],
        x: [-10, 0],
        y: [10, 0],
        scale: [0.5, 1, 1.2, 1],
        transition: {
          duration: 0.6,
        },
      },
    },
    path5: {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: {
        opacity: [0, 0, 0, 1, 1],
        x: [-10, 0],
        y: [10, 0],
        scale: [0.5, 1, 1.2, 1],
        transition: {
          duration: 0.6,
        },
      },
    },
    path6: {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: {
        opacity: [0, 0, 0, 1, 1],
        x: [-5, 0],
        y: [5, 0],
        scale: [0.5, 1, 1.2, 1],
        transition: {
          duration: 0.6,
        },
      },
    },
    path7: popperAnimation,
    path8: popperAnimation,
    path9: popperAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PartyPopperProps) {
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
          d="M5.8 11.3 2 22l10.7-3.79"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
      <motion.path
        animate={controls}
        d="M4 3h.01"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M22 8h.01"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M15 2h.01"
        initial="initial"
        variants={variants.path5}
      />
      <motion.path
        animate={controls}
        d="M22 20h.01"
        initial="initial"
        variants={variants.path6}
      />
      <motion.path
        animate={controls}
        d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"
        initial="initial"
        variants={variants.path7}
      />
      <motion.path
        animate={controls}
        d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"
        initial="initial"
        variants={variants.path8}
      />
      <motion.path
        animate={controls}
        d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"
        initial="initial"
        variants={variants.path9}
      />
    </motion.svg>
  );
}

function PartyPopper(props: PartyPopperProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PartyPopper,
  PartyPopper as PartyPopperIcon,
  type PartyPopperProps,
  type PartyPopperProps as PartyPopperIconProps,
};
