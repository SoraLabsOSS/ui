"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type WifiHighProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 3; i++) {
      animation[`path${i}`] = {
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
              delay: 0.2 * (i - 1),
            },
            scale: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.2,
              delay: 0.2 * (i - 1),
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: WifiHighProps) {
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
      <motion.path
        animate={controls}
        d="M8.5 16.429a5 5 0 0 1 7 0"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M5 12.859a10 10 0 0 1 14 0"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function WifiHigh(props: WifiHighProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  WifiHigh,
  WifiHigh as WifiHighIcon,
  type WifiHighProps,
  type WifiHighProps as WifiHighIconProps,
};
