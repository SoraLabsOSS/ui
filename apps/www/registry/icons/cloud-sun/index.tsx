"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CloudSunProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path1: {
        initial: {
          x: 0,
          y: 0,
        },
        animate: {
          x: [0, -1, 1, 0],
          y: [0, -1, 1, 0],
          transition: {
            duration: 1.4,
            ease: "easeInOut",
          },
        },
      },
      path2: {},
    };

    for (let i = 1; i <= 4; i++) {
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

function IconComponent({ size, ...props }: CloudSunProps) {
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
        d="M13,22h-6c-2.8,0-5-2.2-5-5,0-2.8,2.2-5,5-5,2.4,0,4.4,1.7,4.9,4h1.1c1.7,0,3,1.3,3,3s-1.3,3-3,3Z"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M15.9,12.6c.4-2.2-1.1-4.2-3.3-4.6-.9-.1-1.8,0-2.6.5"
        initial="initial"
        variants={variants.path2}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1="6.3"
        x2="4.9"
        y1="6.3"
        y2="4.9"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1="12"
        x2="12"
        y1="4"
        y2="2"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1="17.7"
        x2="19.1"
        y1="6.3"
        y2="4.9"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line4}
        x1="20"
        x2="22"
        y1="12"
        y2="12"
      />
    </motion.svg>
  );
}

function CloudSun(props: CloudSunProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudSun,
  CloudSun as CloudSunIcon,
  type CloudSunProps,
  type CloudSunProps as CloudSunIconProps,
};
