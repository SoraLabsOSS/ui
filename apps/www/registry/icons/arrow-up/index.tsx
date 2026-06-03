"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ArrowUpProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        y: 0,
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        y: "-25%",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, "-25%", 0],
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
        d: "M12 19V5",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        d: "M12 19V10",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: "m5 12 7-7 7 7",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
      animate: {
        d: "m5 16 7-7 7 7",
        transition: { ease: "easeInOut", duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  "pointing-loop": {
    group: {},
    path1: {
      initial: {
        d: "M12 19V5",
      },
      animate: {
        d: ["M12 19V5", "M12 19V10", "M12 19V5"],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: "m5 12 7-7 7 7",
      },
      animate: {
        d: ["m5 12 7-7 7 7", "m5 16 7-7 7 7", "m5 12 7-7 7 7"],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group: {
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

function IconComponent({ size, ...props }: ArrowUpProps) {
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
          d="M12 19V5"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="m5 12 7-7 7 7"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
    </motion.svg>
  );
}

function ArrowUp(props: ArrowUpProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  ArrowUp,
  ArrowUp as ArrowUpIcon,
  type ArrowUpProps,
  type ArrowUpProps as ArrowUpIconProps,
  animations,
};
