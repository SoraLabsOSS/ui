"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CherryProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -12, 7, -4, 0],
        transformOrigin: "top center",
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CherryProps) {
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
        d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function Cherry(props: CherryProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cherry,
  Cherry as CherryIcon,
  type CherryProps,
  type CherryProps as CherryIconProps,
};
