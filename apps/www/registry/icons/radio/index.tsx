"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type RadioProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 2; i++) {
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

function IconComponent({ size, ...props }: RadioProps) {
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
        d="M16.247 7.761a6 6 0 0 1 0 8.478"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M19.075 4.933a10 10 0 0 1 0 14.134"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M7.753 16.239a6 6 0 0 1 0-8.478"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M4.925 19.067a10 10 0 0 1 0-14.134"
        initial="initial"
        variants={variants.path2}
      />
      <motion.circle
        animate={controls}
        cx="12"
        cy="12"
        initial="initial"
        r="2"
        variants={variants.circle}
      />
    </motion.svg>
  );
}

function Radio(props: RadioProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Radio,
  Radio as RadioIcon,
  type RadioProps,
  type RadioProps as RadioIconProps,
};
