"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type BotProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    rect: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -1.5, 1.5, 0],
        y: [0, 1.5, 1.5, 0],
        transition: {
          ease: "easeInOut",
          duration: 1.3,
        },
      },
    },
    path5: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -1.5, 1.5, 0],
        y: [0, 1.5, 1.5, 0],
        transition: {
          ease: "easeInOut",
          duration: 1.3,
        },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    path1: {},
    rect: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        scaleY: 1,
      },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
    path5: {
      initial: {
        scaleY: 1,
      },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
  } satisfies Record<string, Variants>,
  wink: {
    path1: {},
    rect: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        scaleY: 1,
      },
      animate: {
        scaleY: [1, 0.5, 1],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
    path5: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BotProps) {
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
        d="M12 8V4H8"
        initial="initial"
        variants={variants.path1}
      />
      <motion.rect
        animate={controls}
        height={12}
        initial="initial"
        rx={2}
        variants={variants.rect}
        width={16}
        x={4}
        y={8}
      />
      <motion.path
        animate={controls}
        d="M2 14h2"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M20 14h2"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M15 13v2"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M9 13v2"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function Bot(props: BotProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Bot,
  Bot as BotIcon,
  type BotProps,
  type BotProps as BotIconProps,
};
