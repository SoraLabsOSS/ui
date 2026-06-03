"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type Clock3Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: "easeInOut", duration: 0.6 },
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 20, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: "easeInOut", duration: 0.6 },
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: 360,
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Clock3Props) {
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
      <motion.circle
        animate={controls}
        cx={12}
        cy={12}
        initial="initial"
        r={10}
        variants={variants.circle}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1={16.5}
        x2={12}
        y1={12}
        y2={12}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={12}
        x2={12}
        y1={6}
        y2={12}
      />
    </motion.svg>
  );
}

function Clock3(props: Clock3Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Clock3,
  Clock3 as Clock3Icon,
  type Clock3Props,
  type Clock3Props as Clock3IconProps,
};
