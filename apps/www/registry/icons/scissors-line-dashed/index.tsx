"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ScissorsLineDashedProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: 7,
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    group1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -26, 0, -26, 0],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 26, 0, 26, 0],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
          delay: 0.25,
        },
      },
    },
    path5: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
          delay: 0.85,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ScissorsLineDashedProps) {
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
      <motion.g animate={controls} initial="initial" variants={variants.group}>
        <motion.g
          animate={controls}
          initial="initial"
          variants={variants.group1}
        >
          <motion.circle
            animate={controls}
            cx="4"
            cy="8"
            initial="initial"
            r="2"
            variants={variants.circle1}
          />
          <motion.path
            animate={controls}
            d="M5.42 9.42 8 12"
            initial="initial"
            variants={variants.path1}
          />
          <motion.path
            animate={controls}
            d="M10.8 14.8 14 18"
            initial="initial"
            variants={variants.path2}
          />
        </motion.g>
        <motion.g
          animate={controls}
          initial="initial"
          variants={variants.group2}
        >
          <motion.circle
            animate={controls}
            cx="4"
            cy="16"
            initial="initial"
            r="2"
            variants={variants.circle2}
          />
          <motion.path
            animate={controls}
            d="m14 6-8.58 8.58"
            initial="initial"
            variants={variants.path3}
          />
        </motion.g>
      </motion.g>
      <motion.path
        animate={controls}
        d="M16 12h-2"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M22 12h-2"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function ScissorsLineDashed(props: ScissorsLineDashedProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ScissorsLineDashed,
  ScissorsLineDashed as ScissorsLineDashedwIcon,
  type ScissorsLineDashedProps,
  type ScissorsLineDashedProps as ScissorsLineDashedIconProps,
};
