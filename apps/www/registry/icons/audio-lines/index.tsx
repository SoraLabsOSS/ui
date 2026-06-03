"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type AudioLinesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        y1: 10,
        y2: 13,
      },
      animate: {
        y1: [10, 5, 8, 6, 10],
        y2: [13, 18, 15, 17, 13],
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
    line2: {
      initial: {
        y1: 6,
        y2: 17,
      },
      animate: {
        y1: [6, 2, 10, 6],
        y2: [17, 22, 13, 17],
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
    line3: {
      initial: {
        y1: 3,
        y2: 21,
      },
      animate: {
        y1: [3, 6, 3, 8, 3],
        y2: [21, 17, 21, 15, 21],
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
    line4: {
      initial: {
        y1: 8,
        y2: 15,
      },
      animate: {
        y1: [8, 4, 7, 2, 8],
        y2: [15, 19, 16, 22, 15],
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
    line5: {
      initial: {
        y1: 5,
        y2: 18,
      },
      animate: {
        y1: [5, 10, 4, 8, 5],
        y2: [18, 13, 19, 15, 18],
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
    line6: {
      initial: {
        y1: 10,
        y2: 13,
      },
      animate: {
        y1: [10, 8, 5, 10],
        y2: [13, 15, 18, 13],
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AudioLinesProps) {
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
        x1={2}
        x2={2}
        y1={10}
        y2={13}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={6}
        x2={6}
        y1={6}
        y2={17}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line3}
        x1={10}
        x2={10}
        y1={3}
        y2={21}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line4}
        x1={14}
        x2={14}
        y1={8}
        y2={15}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line5}
        x1={18}
        x2={18}
        y1={5}
        y2={18}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line6}
        x1={22}
        x2={22}
        y1={10}
        y2={13}
      />
    </motion.svg>
  );
}

function AudioLines(props: AudioLinesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  AudioLines,
  AudioLines as AudioLinesIcon,
  type AudioLinesProps,
  type AudioLinesProps as AudioLinesIconProps,
  animations,
};
