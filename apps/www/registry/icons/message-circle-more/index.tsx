"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageCircleMoreProps = IconProps<keyof typeof animations>;

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
    line1: {
      initial: {
        y1: 12,
        y2: 12,
      },
      animate: {
        y1: [12, 10.5, 12],
        y2: [12, 13.5, 12],
        transition: { ease: "easeInOut", duration: 0.6, delay: 0.2 },
      },
    },
    line2: {
      initial: {
        y1: 12,
        y2: 12,
      },
      animate: {
        y1: [12, 10.5, 12],
        y2: [12, 13.5, 12],
        transition: { ease: "easeInOut", duration: 0.6, delay: 0.1 },
      },
    },
    line3: {
      initial: {
        y1: 12,
        y2: 12,
      },
      animate: {
        y1: [12, 10.5, 12],
        y2: [12, 13.5, 12],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  pulse: {
    group: {},
    path: {},
    line1: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.4,
          ease: "easeInOut",
        },
      },
    },
    line2: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.2,
          ease: "easeInOut",
        },
      },
    },
    line3: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
  jump: {
    group: {},
    path: {},
    line1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          delay: 0.4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      },
    },
    line2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          delay: 0.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      },
    },
    line3: {
      initial: {
        y: 0,
      },
      animate: {
        y: [-0.75, 0.75],
        transition: {
          duration: 0.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageCircleMoreProps) {
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
          d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
          initial="initial"
          variants={variants.path}
        />
        <motion.line
          animate={controls}
          initial="initial"
          variants={variants.line1}
          x1="16"
          x2="16"
          y1="12"
          y2="12"
        />
        <motion.line
          animate={controls}
          initial="initial"
          variants={variants.line2}
          x1="12"
          x2="12"
          y1="12"
          y2="12"
        />
        <motion.line
          animate={controls}
          initial="initial"
          variants={variants.line3}
          x1="8"
          x2="8"
          y1="12"
          y2="12"
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageCircleMore(props: MessageCircleMoreProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageCircleMore,
  MessageCircleMore as MessageCircleMoreIcon,
  type MessageCircleMoreProps,
  type MessageCircleMoreProps as MessageCircleMoreIconProps,
};
