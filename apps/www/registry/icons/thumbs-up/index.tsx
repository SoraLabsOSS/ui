"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ThumbsUpProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -20, -12],
        transformOrigin: "bottom left",
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -20, 5, 0],
        transformOrigin: "bottom left",
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ThumbsUpProps) {
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
        d="M7 10v12"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function ThumbsUp(props: ThumbsUpProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ThumbsUp,
  ThumbsUp as ThumbsUpIcon,
  type ThumbsUpProps,
  type ThumbsUpProps as ThumbsUpIconProps,
};
