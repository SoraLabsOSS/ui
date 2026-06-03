"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MoonStarProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        rotate: 0,
        transition: { duration: 0 },
      },
      animate: {
        rotate: [0, -30, 400, 360],
        transition: {
          duration: 1.2,
          times: [0, 0.25, 0.75, 1],
          ease: ["easeInOut", "easeInOut", "easeInOut"],
        },
      },
    },
    group: {
      initial: {
        scale: 1,
        rotate: 0,
        y: 0,
        x: 0,
      },
      animate: {
        scale: [1, 0, 0, 1],
        rotate: [0, 90, 90, 0],
        y: [0, 6, 10, 0],
        x: [0, -10, -6, 0],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
          times: [0, 0.25, 0.65, 1],
        },
      },
    },
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoonStarProps) {
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
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        animate={controls}
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
        initial="initial"
        variants={variants.path1}
      />
      <motion.g animate={controls} initial="initial" variants={variants.group}>
        <motion.path
          animate={controls}
          d="M18 5h4"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M20 3v4"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>
    </motion.svg>
  );
}

function MoonStar(props: MoonStarProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MoonStar,
  MoonStar as MoonStarIcon,
  type MoonStarProps,
  type MoonStarProps as MoonStarIconProps,
};
