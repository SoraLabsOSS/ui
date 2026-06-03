"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type SendProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
        x: 0,
        y: 0,
      },
      animate: {
        scale: [1, 0.8, 1, 1, 1],
        x: [0, "-10%", "100%", "-125%", 0],
        y: [0, "10%", "-100%", "125%", 0],
        transition: {
          default: { ease: "easeInOut", duration: 1.2 },
          x: {
            ease: "easeInOut",
            duration: 1.2,
            times: [0, 0.25, 0.5, 0.5, 1],
          },
          y: {
            ease: "easeInOut",
            duration: 1.2,
            times: [0, 0.25, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SendProps) {
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
          d="M14.5,21.7c.1.3.4.4.7.3.1,0,.2-.2.3-.3L22,2.7c0-.3,0-.5-.3-.6-.1,0-.2,0-.3,0L2.3,8.5c-.3,0-.4.4-.3.6,0,.1.2.2.3.3l7.9,3.2c.5.2.9.6,1.1,1.1l3.2,7.9Z"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M21.9,2.1l-10.9,10.9"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
    </motion.svg>
  );
}

function Send(props: SendProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Send,
  Send as SendIcon,
  type SendProps,
  type SendProps as SendIconProps,
};
