"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ClapperboardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 7, 0],
        scale: [1, 0.9, 1.1, 1],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -4, 15, 0],
        transformOrigin: "bottom left",
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClapperboardProps) {
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
      <motion.g animate={controls} initial="initial" variants={variants.group1}>
        <motion.g
          animate={controls}
          initial="initial"
          variants={variants.group2}
        >
          <motion.path
            animate={controls}
            d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"
            initial="initial"
            variants={variants.path1}
          />
          <motion.path
            animate={controls}
            d="m6.2 5.3 3.1 3.9"
            initial="initial"
            variants={variants.path2}
          />
          <motion.path
            animate={controls}
            d="m12.4 3.4 3.1 4"
            initial="initial"
            variants={variants.path3}
          />
        </motion.g>
        <motion.path
          animate={controls}
          d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
          initial="initial"
          variants={variants.path4}
        />
      </motion.g>
    </motion.svg>
  );
}

function Clapperboard(props: ClapperboardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Clapperboard,
  Clapperboard as ClapperboardIcon,
  type ClapperboardProps,
  type ClapperboardProps as ClapperboardIconProps,
};
