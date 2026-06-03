"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ChartScatterProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 5; i++) {
      animation[`circle${i}`] = {
        initial: { opacity: 1 },
        animate: {
          opacity: [0, 1],
          scale: [0, 1],
          transition: {
            ease: "easeInOut",
            duration: 0.3,
            delay: (i - 1) * 0.3,
          },
        },
      };
    }

    return animation as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChartScatterProps) {
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
        cx="7.5"
        cy="7.5"
        initial="initial"
        r=".5"
        variants={variants.circle1}
      />
      <motion.circle
        animate={controls}
        cx="18.5"
        cy="5.5"
        initial="initial"
        r=".5"
        variants={variants.circle2}
      />
      <motion.circle
        animate={controls}
        cx="11.5"
        cy="11.5"
        initial="initial"
        r=".5"
        variants={variants.circle3}
      />
      <motion.circle
        animate={controls}
        cx="7.5"
        cy="16.5"
        initial="initial"
        r=".5"
        variants={variants.circle4}
      />
      <motion.circle
        animate={controls}
        cx="17.5"
        cy="14.5"
        initial="initial"
        r=".5"
        variants={variants.circle5}
      />
      <motion.path
        animate={controls}
        d="M3 3v16a2 2 0 0 0 2 2h16"
        initial="initial"
        variants={variants.path}
      />
    </motion.svg>
  );
}

function ChartScatter(props: ChartScatterProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChartScatter,
  ChartScatter as ChartScatterIcon,
  type ChartScatterProps,
  type ChartScatterProps as ChartScatterIconProps,
};
