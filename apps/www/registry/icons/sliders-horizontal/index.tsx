"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SlidersHorizontalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { x2: 10 },
      animate: { x2: 4, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line2: {
      initial: { x1: 14, x2: 14 },
      animate: {
        x1: 8,
        x2: 8,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
    },
    line3: {
      initial: { x1: 14 },
      animate: { x1: 8, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line4: {
      initial: { x2: 8 },
      animate: { x2: 16, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line5: {
      initial: { x1: 8, x2: 8 },
      animate: {
        x1: 16,
        x2: 16,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
    },
    line6: {
      initial: { x1: 12 },
      animate: { x1: 20, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line7: {
      initial: { x2: 12 },
      animate: { x2: 7, transition: { ease: "easeInOut", duration: 0.4 } },
    },
    line8: {
      initial: { x1: 16, x2: 16 },
      animate: {
        x1: 11,
        x2: 11,
        transition: { ease: "easeInOut", duration: 0.4 },
      },
    },
    line9: {
      initial: { x1: 16 },
      animate: { x1: 11, transition: { ease: "easeInOut", duration: 0.4 } },
    },
  } satisfies Record<string, Variants>,
  "default-loop": {
    line1: {
      initial: { x2: 10 },
      animate: {
        x2: [10, 4, 10],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line2: {
      initial: { x1: 14, x2: 14 },
      animate: {
        x1: [14, 8, 14],
        x2: [14, 8, 14],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line3: {
      initial: { x1: 14 },
      animate: {
        x1: [14, 8, 14],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line4: {
      initial: { x2: 8 },
      animate: {
        x2: [8, 16, 8],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line5: {
      initial: { x1: 8, x2: 8 },
      animate: {
        x1: [8, 16, 8],
        x2: [8, 16, 8],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line6: {
      initial: { x1: 12 },
      animate: {
        x1: [12, 20, 12],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line7: {
      initial: { x2: 12 },
      animate: {
        x2: [12, 7, 12],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line8: {
      initial: { x1: 16, x2: 16 },
      animate: {
        x1: [16, 11, 16],
        x2: [16, 11, 16],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
    line9: {
      initial: { x1: 16 },
      animate: {
        x1: [16, 11, 16],
        transition: { ease: "easeInOut", duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SlidersHorizontalProps) {
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
        x1="3"
        x2="10"
        y1="5"
        y2="5"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1="14"
        x2="14"
        y1="3"
        y2="7"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1="14"
        x2="21"
        y1="5"
        y2="5"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line4}
        x1="3"
        x2="8"
        y1="12"
        y2="12"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line5}
        x1="8"
        x2="8"
        y1="10"
        y2="14"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line6}
        x1="12"
        x2="21"
        y1="12"
        y2="12"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line7}
        x1="3"
        x2="12"
        y1="19"
        y2="19"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line8}
        x1="16"
        x2="16"
        y1="17"
        y2="21"
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line9}
        x1="16"
        x2="21"
        y1="19"
        y2="19"
      />
    </motion.svg>
  );
}

function SlidersHorizontal(props: SlidersHorizontalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SlidersHorizontal,
  SlidersHorizontal as SlidersHorizontalIcon,
  type SlidersHorizontalProps,
  type SlidersHorizontalProps as SlidersHorizontalIconProps,
};
