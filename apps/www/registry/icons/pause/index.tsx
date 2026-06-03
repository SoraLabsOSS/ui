"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PauseProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: 1.5,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: -1.5,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1.5, 0],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -1.5, 0],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PauseProps) {
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
      <motion.rect
        animate={controls}
        height={16}
        initial="initial"
        rx={1}
        variants={variants.rect1}
        width={4}
        x={14}
        y={4}
      />
      <motion.rect
        animate={controls}
        height={16}
        initial="initial"
        rx={1}
        variants={variants.rect2}
        width={4}
        x={6}
        y={4}
      />
    </motion.svg>
  );
}

function Pause(props: PauseProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Pause,
  Pause as PauseIcon,
  type PauseProps,
  type PauseProps as PauseIconProps,
};
