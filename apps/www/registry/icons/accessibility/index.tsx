"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type AccessibilityProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 5, -5, 0],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: -360,
        transition: {
          duration: 1,
          delay: 0.4,
          ease: "easeInOut",
        },
      },
    },
    circle: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 1, -1, 0],
        x: [0, 1, -1, 0],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: {
        rotate: 0,
        d: "M8 5 L5 8",
      },
      animate: {
        rotate: [0, -60, 0],
        d: ["M8 5 L5 8", "M8 5 L4 9", "M8 5 L5 8"],
        transition: {
          duration: 0.4,
          delay: 0.2,
          ease: "easeInOut",
        },
        transformOrigin: "top right",
      },
    },
    path4: {},
    path5: {},
    path6: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AccessibilityProps) {
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
      <motion.circle
        animate={controls}
        cx="16"
        cy="4"
        initial="initial"
        r="1"
        variants={variants.circle}
      />
      <motion.g animate={controls} initial="initial" variants={variants.group1}>
        <motion.path
          animate={controls}
          d="M18,19l1-7-6,1"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M8,5l5.5,3-2.4,3.5"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M8 5 L5 8"
          initial="initial"
          variants={variants.path3}
        />
      </motion.g>
      <motion.g animate={controls} initial="initial" variants={variants.group2}>
        <motion.path
          animate={controls}
          d="M4.2,14.5c-.8,2.6.7,5.4,3.3,6.2,1.2.4,2.4.3,3.6-.2"
          initial="initial"
          variants={variants.path4}
        />
        <motion.path
          animate={controls}
          d="M13.8,17.5c.8-2.6-.7-5.4-3.3-6.2-1.2-.4-2.4-.3-3.6.2"
          initial="initial"
          variants={variants.path5}
        />
      </motion.g>
      <motion.path
        animate={controls}
        d="M13,13.1c-.5-.7-1.1-1.2-1.9-1.6"
        initial="initial"
        variants={variants.path6}
      />
    </motion.svg>
  );
}

function Accessibility(props: AccessibilityProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Accessibility,
  Accessibility as AccessibilityIcon,
  type AccessibilityProps,
  type AccessibilityProps as AccessibilityIconProps,
  animations,
};
