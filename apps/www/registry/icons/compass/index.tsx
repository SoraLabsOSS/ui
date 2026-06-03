"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CompassProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 95, 75],
        transition: {
          duration: 0.7,
          ease: "easeInOut",
        },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    path: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 95, 75, -20, 0],
        transition: {
          duration: 1.4,
          ease: "easeInOut",
        },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CompassProps) {
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
        d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"
        initial="initial"
        variants={variants.path}
      />
      <motion.circle
        animate={controls}
        cx={12}
        cy={12}
        initial="initial"
        r={10}
        variants={variants.circle}
      />
    </motion.svg>
  );
}

function Compass(props: CompassProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Compass,
  Compass as CompassIcon,
  type CompassProps,
  type CompassProps as CompassIconProps,
};
