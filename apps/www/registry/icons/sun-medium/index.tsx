"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SunMediumProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      circle: {},
    };

    for (let i = 1; i <= 8; i++) {
      animation[`line${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: [0, 1],
          pathLength: [0, 1],
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

function IconComponent({ size, ...props }: SunMediumProps) {
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
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1="12"
        x2="12"
        y1="4"
        y2="3"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1="17.7"
        x2="18.4"
        y1="6.3"
        y2="5.6"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1="20"
        x2="21"
        y1="12"
        y2="12"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line4}
        x1="17.7"
        x2="18.4"
        y1="17.7"
        y2="18.4"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line5}
        x1="12"
        x2="12"
        y1="20"
        y2="21"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line6}
        x1="6.3"
        x2="5.6"
        y1="17.7"
        y2="18.4"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line7}
        x1="4"
        x2="3"
        y1="12"
        y2="12"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line8}
        x1="6.3"
        x2="5.6"
        y1="6.3"
        y2="5.6"
      />
    </motion.svg>
  );
}

function SunMedium(props: SunMediumProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SunMedium,
  SunMedium as SunMediumIcon,
  type SunMediumProps,
  type SunMediumProps as SunMediumIconProps,
};
