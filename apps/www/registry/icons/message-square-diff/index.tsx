"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type MessageSquareDiffProps = IconProps<keyof typeof animations>;

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
    path2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
    path3: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
          delay: 0.05,
        },
      },
    },
    path4: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 1, -1, 0],
        transition: {
          ease: "easeInOut",
          duration: 0.7,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareDiffProps) {
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
          d="m5 19-2 2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M12 7v6"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M9 10h6"
          initial="initial"
          variants={variants.path3}
        />
        <motion.path
          animate={controls}
          d="M9 17h6"
          initial="initial"
          variants={variants.path4}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareDiff(props: MessageSquareDiffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareDiff,
  MessageSquareDiff as MessageSquareDiffIcon,
  type MessageSquareDiffProps,
  type MessageSquareDiffProps as MessageSquareDiffIconProps,
};
