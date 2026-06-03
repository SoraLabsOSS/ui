"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MoveUpProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        y: "-15%",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, "-15%", 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: "M12 2V22",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        d: "M12 12V22",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: "M8 6L12 2L16 6",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        d: "M8 16L12 12L16 16",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  "pointing-loop": {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: "M12 2V22",
      },
      animate: {
        d: ["M12 2V22", "M12 12V22", "M12 2V22"],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: "M8 6L12 2L16 6",
      },
      animate: {
        d: ["M8 6L12 2L16 6", "M8 16L12 12L16 16", "M8 6L12 2L16 6"],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, "-150%", "150%", 0],
        transition: {
          default: { ease: "easeInOut", duration: 0.6 },
          y: {
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

function IconComponent({ size, ...props }: MoveUpProps) {
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
      variants={variants.group1}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.g animate={controls} initial="initial" variants={variants.group2}>
        <motion.path
          animate={controls}
          d="M12 2V22"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M8 6L12 2L16 6"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
    </motion.svg>
  );
}

function MoveUp(props: MoveUpProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MoveUp,
  MoveUp as MoveUpIcon,
  type MoveUpProps,
  type MoveUpProps as MoveUpIconProps,
};
