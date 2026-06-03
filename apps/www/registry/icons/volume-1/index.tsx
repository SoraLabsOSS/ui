"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type Volume1Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: "easeInOut",
            repeat: 1,
            repeatType: "reverse",
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: "easeInOut",
            repeat: 1,
            repeatType: "reverse",
            repeatDelay: 0.2,
          },
        },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Volume1Props) {
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
      <motion.path
        animate={controls}
        d="M16 9a5 5 0 0 1 0 6"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function Volume1(props: Volume1Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Volume1,
  Volume1 as Volume1Icon,
  type Volume1Props,
  type Volume1Props as Volume1IconProps,
};
