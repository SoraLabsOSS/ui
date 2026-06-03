"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MoonProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        rotate: 0,
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
      animate: {
        rotate: [0, -30, 400, 360],
        transition: {
          duration: 1.2,
          times: [0, 0.25, 0.75, 1],
          ease: ["easeInOut", "easeInOut", "easeInOut"],
        },
      },
    },
  } satisfies Record<string, Variants>,
  balancing: {
    path: {
      initial: {
        rotate: 0,
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
      animate: {
        rotate: [0, -30, 25, -15, 10, -5, 0],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoonProps) {
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
      <motion.path
        animate={controls}
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
        initial="initial"
        variants={variants.path}
      />
    </motion.svg>
  );
}

function Moon(props: MoonProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Moon,
  Moon as MoonIcon,
  type MoonProps,
  type MoonProps as MoonIconProps,
};
