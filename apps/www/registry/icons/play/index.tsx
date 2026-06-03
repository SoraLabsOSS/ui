"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type PlayProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        x: 3,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.6, ease: "easeInOut" },
      },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PlayProps) {
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
      <motion.polygon
        animate={controls}
        initial="initial"
        points="6 3 20 12 6 21 6 3"
        variants={variants.polygon}
      />
    </motion.svg>
  );
}

function Play(props: PlayProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Play,
  Play as PlayIcon,
  type PlayProps,
  type PlayProps as PlayIconProps,
};
