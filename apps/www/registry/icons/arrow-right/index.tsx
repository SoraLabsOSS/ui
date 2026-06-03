"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ArrowRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        x: "25%",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, "25%", 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group: {},
    path1: {
      initial: {
        d: "M5 12h14",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        d: "M5 12h10",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: "m12 5 7 7-7 7",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        d: "m8 5 7 7-7 7",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  "pointing-loop": {
    group: {},
    path1: {
      initial: {
        d: "M5 12h14",
      },
      animate: {
        d: ["M5 12h14", "M5 12h10", "M5 12h14"],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: "m12 5 7 7-7 7",
      },
      animate: {
        d: ["m12 5 7 7-7 7", "m8 5 7 7-7 7", "m12 5 7 7-7 7"],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, "150%", "-150%", 0],
        transition: {
          default: { ease: "easeInOut", duration: 0.6 },
          x: {
            ease: "easeInOut",
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArrowRightProps) {
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
          d="M5 12h14"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="m12 5 7 7-7 7"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
    </motion.svg>
  );
}

function ArrowRight(props: ArrowRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  ArrowRight,
  ArrowRight as ArrowRightIcon,
  type ArrowRightProps,
  type ArrowRightProps as ArrowRightIconProps,
  animations,
};
