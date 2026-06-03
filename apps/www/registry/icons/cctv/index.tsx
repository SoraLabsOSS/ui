"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CctvProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        y: 0,
        x: 0,
      },
      animate: {
        rotate: [0, -20, -20, 15, 15, 0],
        y: [0, -0.5, -0.5, 0, 0, 0],
        x: [0, 0, 0, 0.5, 0.5, 0],
        transition: {
          duration: 1.8,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: {
        opacity: 1,
      },
      animate: {
        opacity: [1, 0, 1, 0, 1, 0, 1],
        transition: {
          duration: 1.8,
          ease: "easeInOut",
        },
      },
    },
    path4: {},
    path5: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CctvProps) {
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
          d="M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M7 9h.01"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>

      <motion.path
        animate={controls}
        d="M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15"
        initial="initial"
        variants={variants.path4}
      />

      <motion.path
        animate={controls}
        d="M2 21v-4"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function Cctv(props: CctvProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cctv,
  Cctv as CctvIcon,
  type CctvProps,
  type CctvProps as CctvIconProps,
};
