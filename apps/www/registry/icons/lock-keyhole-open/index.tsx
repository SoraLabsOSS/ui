"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type LockKeyholeOpenProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, -5, 0],
        scale: [1, 0.9, 1, 1],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    path: {
      initial: {
        pathLength: 0.8,
      },
      animate: {
        pathLength: [0.8, 1, 0.8, 0.8],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  lock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    path: {
      initial: {
        pathLength: 0.8,
      },
      animate: {
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  unlock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    path: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: 0.8,
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LockKeyholeOpenProps) {
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
      <motion.g animate={controls} initial="initial" variants={variants.group}>
        <motion.circle
          animate={controls}
          cx="12"
          cy="16"
          initial="initial"
          r="1"
          variants={variants.circle}
        />
        <motion.rect
          animate={controls}
          height="12"
          initial="initial"
          rx="2"
          variants={variants.rect}
          width="18"
          x="3"
          y="10"
        />
        <motion.path
          animate={controls}
          d="M7 10V7a5 5 0 0 1 10 0v3"
          initial="initial"
          variants={variants.path}
        />
      </motion.g>
    </motion.svg>
  );
}

function LockKeyholeOpen(props: LockKeyholeOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LockKeyholeOpen,
  LockKeyholeOpen as LockKeyholeOpenIcon,
  type LockKeyholeOpenProps,
  type LockKeyholeOpenProps as LockKeyholeOpenIconProps,
};
