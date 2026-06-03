"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageCircleDashedProps = IconProps<keyof typeof animations>;

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
  } satisfies Record<string, Variants>,
  draw: {
    group: {},
    ...(() => {
      const paths: Record<string, Variants> = {};

      for (let i = 1; i <= 8; i++) {
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

function IconComponent({ size, ...props }: MessageCircleDashedProps) {
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
          d="M13.5 3.1c-.5 0-1-.1-1.5-.1s-1 .1-1.5.1"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M19.3 6.8a10.45 10.45 0 0 0-2.1-2.1"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M20.9 13.5c.1-.5.1-1 .1-1.5s-.1-1-.1-1.5"
          initial="initial"
          variants={variants.path3}
        />
        <motion.path
          animate={controls}
          d="M17.2 19.3a10.45 10.45 0 0 0 2.1-2.1"
          initial="initial"
          variants={variants.path4}
        />
        <motion.path
          animate={controls}
          d="M10.5 20.9c.5.1 1 .1 1.5.1s1-.1 1.5-.1"
          initial="initial"
          variants={variants.path5}
        />
        <motion.path
          animate={controls}
          d="M3.5 17.5 2 22l4.5-1.5"
          initial="initial"
          variants={variants.path6}
        />
        <motion.path
          animate={controls}
          d="M3.1 10.5c0 .5-.1 1-.1 1.5s.1 1 .1 1.5"
          initial="initial"
          variants={variants.path7}
        />
        <motion.path
          animate={controls}
          d="M6.8 4.7a10.45 10.45 0 0 0-2.1 2.1"
          initial="initial"
          variants={variants.path8}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageCircleDashed(props: MessageCircleDashedProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageCircleDashed,
  MessageCircleDashed as MessageCircleDashedIcon,
  type MessageCircleDashedProps,
  type MessageCircleDashedProps as MessageCircleDashedIconProps,
};
