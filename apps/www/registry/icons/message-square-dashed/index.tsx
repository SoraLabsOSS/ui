"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageSquareDashedProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 8, -8, 2, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
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
    path9: {},
  } satisfies Record<string, Variants>,
  draw: {
    group: {},
    ...(() => {
      const paths: Record<string, Variants> = {};

      for (let i = 1; i <= 9; i++) {
        paths[`path${i}`] = {
          initial: { opacity: 0, scale: 0 },
          animate: {
            opacity: [0, 1],
            scale: [0, 1],
            transition: {
              delay: i * 0.2,
              duration: 0.4,
            },
          },
        };
      }

      return paths;
    })(),
  },
} as const;

function IconComponent({ size, ...props }: MessageSquareDashedProps) {
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
        <motion.path
          animate={controls}
          d="M5 3a2 2 0 0 0-2 2"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M9 3h1"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M14 3h1"
          initial="initial"
          variants={variants.path3}
        />
        <motion.path
          animate={controls}
          d="M19 3a2 2 0 0 1 2 2"
          initial="initial"
          variants={variants.path4}
        />
        <motion.path
          animate={controls}
          d="M21 9v1"
          initial="initial"
          variants={variants.path5}
        />
        <motion.path
          animate={controls}
          d="M21 14v1a2 2 0 0 1-2 2"
          initial="initial"
          variants={variants.path6}
        />
        <motion.path
          animate={controls}
          d="M14 17h1"
          initial="initial"
          variants={variants.path7}
        />
        <motion.path
          animate={controls}
          d="M10 17H7l-4 4v-7"
          initial="initial"
          variants={variants.path8}
        />
        <motion.path
          animate={controls}
          d="M3 9v1"
          initial="initial"
          variants={variants.path9}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareDashed(props: MessageSquareDashedProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareDashed,
  MessageSquareDashed as MessageSquareDashedIcon,
  type MessageSquareDashedProps,
  type MessageSquareDashedProps as MessageSquareDashedIconProps,
};
