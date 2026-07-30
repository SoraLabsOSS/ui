"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
  useAnimateIconVariants,
} from "@/registry/icons/icon";

type ChevronsProps = IconProps<keyof typeof animations>;

const TOP = [0, 0, 0.15, 1, 1, 0.85, 0];
const BOTTOM = [0, 1, 1, 0.85, 0, 0, 0];
const TIMES = [0, 0.22, 0.3, 0.5, 0.72, 0.8, 1];

const animations = {
  default: {
    top: {
      initial: { opacity: 1 },
      animate: {
        opacity: TOP,
        transition: { duration: 0.75, ease: "easeInOut", times: TIMES },
      },
    },
    bottom: {
      initial: { opacity: 1 },
      animate: {
        opacity: BOTTOM,
        transition: { duration: 0.75, ease: "easeInOut", times: TIMES },
      },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    top: {
      initial: { opacity: 1 },
      animate: {
        opacity: TOP,
        transition: {
          duration: 0.75,
          ease: "easeInOut",
          times: TIMES,
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
    bottom: {
      initial: { opacity: 1 },
      animate: {
        opacity: BOTTOM,
        transition: {
          duration: 0.75,
          ease: "easeInOut",
          times: TIMES,
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({
  size,
  color = "currentColor",
  ...props
}: ChevronsProps) {
  const { controls } = useAnimateIconContext();
  const variants = useAnimateIconVariants(animations);
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <motion.svg
        aria-hidden="true"
        fill="none"
        height={size}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.25}
        viewBox="0 0 16 16"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d="M5.2168 6.90625L8.3418 3.78125L11.4668 6.90625" />
        <path d="M5.2168 11.2812L8.3418 8.15625L11.4668 11.2812" />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        animate={controls}
        d="M5.2168 6.90625L8.3418 3.78125L11.4668 6.90625"
        initial="initial"
        variants={variants.top}
      />
      <motion.path
        animate={controls}
        d="M5.2168 11.2812L8.3418 8.15625L11.4668 11.2812"
        initial="initial"
        variants={variants.bottom}
      />
    </motion.svg>
  );
}

function Chevrons(props: ChevronsProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Chevrons,
  Chevrons as ChevronsIcon,
  type ChevronsProps,
  type ChevronsProps as ChevronsIconProps,
};
