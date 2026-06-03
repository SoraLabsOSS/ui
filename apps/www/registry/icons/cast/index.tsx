"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CastProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path4: {},
    };

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

function IconComponent({ size, ...props }: CastProps) {
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
        d="M2 20 L2 20"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M2 16a5 5 0 0 1 4 4"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M2 12a9 9 0 0 1 8 8"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function Cast(props: CastProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cast,
  Cast as CastIcon,
  type CastProps,
  type CastProps as CastIconProps,
};
