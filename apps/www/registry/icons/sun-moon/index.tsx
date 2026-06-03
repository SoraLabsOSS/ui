"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SunMoonProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path1: {
        initial: {
          rotate: 0,
        },
        animate: {
          rotate: [0, -10, 10, 0],
          transition: {
            duration: 0.6,
            ease: "easeInOut",
          },
        },
      },
      path2: {},
    };

    for (let i = 1; i <= 3; i++) {
      animation[`line${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: [0, 1],
          pathLength: [0, 1],
          transition: {
            duration: 0.6,
            ease: "easeInOut",
            delay: (i - 1) * 0.15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SunMoonProps) {
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
        d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M16 12a4 4 0 0 0-4-4"
        initial="initial"
        variants={variants.path2}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1="12"
        x2="12"
        y1="4"
        y2="2"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1="17.7"
        x2="19"
        y1="6.3"
        y2="5"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1="20"
        x2="22"
        y1="12"
        y2="12"
      />
    </motion.svg>
  );
}

function SunMoon(props: SunMoonProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SunMoon,
  SunMoon as SunMoonIcon,
  type SunMoonProps,
  type SunMoonProps as SunMoonIconProps,
};
