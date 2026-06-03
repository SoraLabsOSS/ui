"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type LockOpenProps = IconProps<keyof typeof animations>;

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
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LockOpenProps) {
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
        <motion.rect
          animate={controls}
          height="11"
          initial="initial"
          rx="2"
          ry="2"
          variants={variants.rect}
          width="18"
          x="3"
          y="11"
        />
        <motion.path
          animate={controls}
          d="M7 11V7a5 5 0 0 1 10 0v4"
          initial="initial"
          variants={variants.path}
        />
      </motion.g>
    </motion.svg>
  );
}

function LockOpen(props: LockOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  LockOpen,
  LockOpen as LockOpenIcon,
  type LockOpenProps,
  type LockOpenProps as LockOpenIconProps,
};
