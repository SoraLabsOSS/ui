"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type RouterProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      rect: {},
      path3: {
        initial: { opacity: 1 },
        animate: {
          opacity: [1, 0, 1, 0, 1],
          transition: {
            duration: 0.8,
            ease: "easeInOut",
          },
        },
      },
      path4: {
        initial: { opacity: 1 },
        animate: {
          opacity: [0, 1, 0, 1],
          transition: {
            duration: 0.8,
            ease: "easeInOut",
          },
        },
      },
      path5: {},
    };

    for (let i = 1; i <= 2; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: 0,
          scale: 0,
          transition: {
            opacity: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.2,
              delay: 0.2 * (i - 1),
            },
            scale: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.2,
              delay: 0.2 * (i - 1),
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RouterProps) {
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
      <motion.rect
        animate={controls}
        height="8"
        initial="initial"
        rx="2"
        variants={variants.rect}
        width="20"
        x="2"
        y="14"
      />
      <motion.path
        animate={controls}
        d="M17.84 7.17a4 4 0 0 0-5.66 0"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M20.66 4.34a8 8 0 0 0-11.31 0"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M6.01 18H6"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M10.01 18H10"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M15 10v4"
        initial="initial"
        variants={variants.path5}
      />
    </motion.svg>
  );
}

function Router(props: RouterProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Router,
  Router as RouterIcon,
  type RouterProps,
  type RouterProps as RouterIconProps,
};
