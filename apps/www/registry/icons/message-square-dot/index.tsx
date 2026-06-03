"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageSquareDotProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 8, -8, 2, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path: {},
    circle: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -2, 0],
        y: [0, 2, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareDotProps) {
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
          d="M11.7 3H5a2 2 0 0 0-2 2v16l4-4h12a2 2 0 0 0 2-2v-2.7"
          initial="initial"
          variants={variants.path}
        />
        <motion.circle
          animate={controls}
          cx="18"
          cy="6"
          initial="initial"
          r="3"
          variants={variants.circle}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareDot(props: MessageSquareDotProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareDot,
  MessageSquareDot as MessageSquareDotIcon,
  type MessageSquareDotProps,
  type MessageSquareDotProps as MessageSquareDotIconProps,
};
