"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type LoaderProps = IconProps<keyof typeof animations>;

const SEGMENT_COUNT = 8;
const DURATION = 1.2;
const BASE_OPACITY = 0.25;

const animations = {
  default: (() => {
    const spinner: Record<string, Variants> = {
      group: { initial: {}, animate: {} },
    };

    for (let i = 1; i <= SEGMENT_COUNT; i++) {
      const reverseIndex = SEGMENT_COUNT - i;
      const delay = -(reverseIndex * DURATION) / SEGMENT_COUNT;

      spinner[`path${i}`] = {
        initial: { opacity: 1 },
        animate: {
          opacity: [1, BASE_OPACITY],
          transition: {
            duration: DURATION,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay,
          },
        },
      };
    }

    return spinner as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
  spin: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 1.5,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LoaderProps) {
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
      variants={variants.group}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        animate={controls}
        d="M12 2v4"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m16.2 7.8 2.9-2.9"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M18 12h4"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="m16.2 16.2 2.9 2.9"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M12 18v4"
        initial="initial"
        variants={variants.path5}
      />
      <motion.path
        animate={controls}
        d="m4.9 19.1 2.9-2.9"
        initial="initial"
        variants={variants.path6}
      />
      <motion.path
        animate={controls}
        d="M2 12h4"
        initial="initial"
        variants={variants.path7}
      />
      <motion.path
        animate={controls}
        d="m4.9 4.9 2.9 2.9"
        initial="initial"
        variants={variants.path8}
      />
    </motion.svg>
  );
}

function Loader(props: LoaderProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Loader,
  Loader as LoaderIcon,
  type LoaderProps,
  type LoaderProps as LoaderIconProps,
};
