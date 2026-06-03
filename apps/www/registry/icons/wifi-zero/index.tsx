"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type WifiZeroProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: "easeInOut",
            repeat: 1,
            repeatType: "reverse",
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: "easeInOut",
            repeat: 1,
            repeatType: "reverse",
            repeatDelay: 0.2,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiZeroProps) {
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
        d="M12 20h.01"
        initial="initial"
        variants={variants.path1}
      />
    </motion.svg>
  );
}

function WifiZero(props: WifiZeroProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiZero,
  WifiZero as WifiZeroIcon,
  type WifiZeroProps,
  type WifiZeroProps as WifiZeroIconProps,
};
