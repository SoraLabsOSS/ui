"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type UnplugProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        d: "m19 5 3-3",
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        d: "m16 8 6-6",
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: -3,
        y: 3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path3: {
      initial: {
        d: "m2 22 3-3",
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        d: "m2 22 6-6",
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path4: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 3,
        y: -3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path5: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 3,
        y: -3,
        pathLength: [1, 0],
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
    path6: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 3,
        y: -3,
        pathLength: [1, 0],
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    path1: {
      initial: {
        d: "m19 5 3-3",
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        d: ["m19 5 3-3", "m16 8 6-6", "m19 5 3-3"],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: [0, -3, 0],
        y: [0, 3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path3: {
      initial: {
        d: "m2 22 3-3",
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        d: ["m2 22 3-3", "m2 22 6-6", "m2 22 3-3"],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path4: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: [0, 3, 0],
        y: [0, -3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path5: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: [0, 3, 0],
        y: [0, -3, 0],
        pathLength: [1, 0, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
    path6: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: [0, 3, 0],
        y: [0, -3, 0],
        pathLength: [1, 0, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: UnplugProps) {
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
        d="m19 5 3-3"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="m2 22 3-3"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M7.5 13.5 10 11"
        initial="initial"
        variants={variants.path5}
      />
      <motion.path
        animate={controls}
        d="M10.5 16.5 13 14"
        initial="initial"
        variants={variants.path6}
      />
    </motion.svg>
  );
}

function Unplug(props: UnplugProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Unplug,
  Unplug as UnplugIcon,
  type UnplugProps,
  type UnplugProps as UnplugIconProps,
};
