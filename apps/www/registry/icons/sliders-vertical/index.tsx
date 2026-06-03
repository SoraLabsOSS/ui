"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SlidersVerticalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { y2: 10 },
      animate: { y2: 4, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line2: {
      initial: { y1: 14, y2: 14 },
      animate: {
        y1: 8,
        y2: 8,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
    },
    line3: {
      initial: { y1: 14 },
      animate: { y1: 8, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line4: {
      initial: { y2: 12 },
      animate: { y2: 20, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line5: {
      initial: { y1: 8, y2: 8 },
      animate: {
        y1: 16,
        y2: 16,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
    },
    line6: {
      initial: { y1: 8 },
      animate: { y1: 16, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line7: {
      initial: { y2: 16 },
      animate: { y2: 11, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line8: {
      initial: { y1: 16, y2: 16 },
      animate: {
        y1: 11,
        y2: 11,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
    },
    line9: {
      initial: { y1: 12 },
      animate: { y1: 7, transition: { ease: "easeInOut", duration: 0.4 } },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    line1: {
      initial: { y2: 10 },
      animate: {
        y2: [10, 4, 10],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line2: {
      initial: { y1: 14, y2: 14 },
      animate: {
        y1: [14, 8, 14],
        y2: [14, 8, 14],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line3: {
      initial: { y1: 14 },
      animate: {
        y1: [14, 8, 14],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line4: {
      initial: { y2: 12 },
      animate: {
        y2: [12, 20, 12],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line5: {
      initial: { y1: 8, y2: 8 },
      animate: {
        y1: [8, 16, 8],
        y2: [8, 16, 8],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line6: {
      initial: { y1: 8 },
      animate: {
        y1: [8, 16, 8],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line7: {
      initial: { y2: 16 },
      animate: {
        y2: [16, 11, 16],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line8: {
      initial: { y1: 16, y2: 16 },
      animate: {
        y1: [16, 11, 16],
        y2: [16, 11, 16],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line9: {
      initial: { y1: 12 },
      animate: {
        y1: [12, 7, 12],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SlidersVerticalProps) {
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
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1="5"
        x2="5"
        y1="3"
        y2="10"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1="3"
        x2="7"
        y1="14"
        y2="14"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1="5"
        x2="5"
        y1="14"
        y2="21"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line4}
        x1="12"
        x2="12"
        y1="21"
        y2="12"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line5}
        x1="10"
        x2="14"
        y1="8"
        y2="8"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line6}
        x1="12"
        x2="12"
        y1="8"
        y2="3"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line7}
        x1="19"
        x2="19"
        y1="21"
        y2="16"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line8}
        x1="17"
        x2="21"
        y1="16"
        y2="16"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line9}
        x1="19"
        x2="19"
        y1="12"
        y2="3"
      />
    </motion.svg>
  );
}

function SlidersVertical(props: SlidersVerticalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SlidersVertical,
  SlidersVertical as SlidersVerticalIcon,
  type SlidersVerticalProps,
  type SlidersVerticalProps as SlidersVerticalIconProps,
};
