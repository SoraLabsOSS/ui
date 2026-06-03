"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SunDimProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      circle: {},
    };

    for (let i = 1; i <= 8; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: [0, 1],
          scale: [0, 1],
          transition: {
            duration: 0.6,
            ease: "easeInOut",
            delay: (i - 1) * 0.15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SunDimProps) {
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
      <motion.circle
        animate={controls}
        cx="12"
        cy="12"
        initial="initial"
        r="4"
        variants={variants.circle}
      />
      <motion.path
        animate={controls}
        d="M12 4h.01"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M17.657 6.343h.01"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M20 12h.01"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M17.657 17.657h.01"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M12 20h.01"
        initial="initial"
        variants={variants.path5}
      />
      <motion.path
        animate={controls}
        d="M6.343 17.657h.01"
        initial="initial"
        variants={variants.path6}
      />
      <motion.path
        animate={controls}
        d="M4 12h.01"
        initial="initial"
        variants={variants.path7}
      />
      <motion.path
        animate={controls}
        d="M6.343 6.343h.01"
        initial="initial"
        variants={variants.path8}
      />
    </motion.svg>
  );
}

function SunDim(props: SunDimProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SunDim,
  SunDim as SunDimIcon,
  type SunDimProps,
  type SunDimProps as SunDimIconProps,
};
