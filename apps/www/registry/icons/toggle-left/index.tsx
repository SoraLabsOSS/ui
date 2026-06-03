"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ToggleLeftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    circle: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 7, 6],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    rect: {},
    circle: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 7, 6, -1, 0],
        transition: {
          duration: 1,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ToggleLeftProps) {
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
      <motion.rect
        animate={controls}
        height={14}
        initial="initial"
        rx={7}
        variants={variants.rect}
        width={20}
        x={2}
        y={5}
      />
      <motion.circle
        animate={controls}
        cx={9}
        cy={12}
        initial="initial"
        r={3}
        variants={variants.circle}
      />
    </motion.svg>
  );
}

function ToggleLeft(props: ToggleLeftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ToggleLeft,
  ToggleLeft as ToggleLeftIcon,
  type ToggleLeftProps,
  type ToggleLeftProps as ToggleLeftIconProps,
};
