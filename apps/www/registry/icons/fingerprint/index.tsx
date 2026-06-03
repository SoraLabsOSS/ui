"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion, type Variants } from "motion/react";
import {
  getVariants,
  type IconProps,
  IconWrapper,
  pathClassName,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type FingerprintProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const variants: Record<string, Variants> = {
      group: {
        initial: {
          scale: 1,
        },
        animate: {
          scale: [1, 1.1, 1],
          transition: {
            ease: "easeInOut",
            duration: 1.5,
          },
        },
      },
      path: {
        initial: {
          strokeOpacity: 0.2,
        },
      },
    };
    new Array(9).fill(0).forEach((_, i) => {
      variants[`path${i + 1}`] = {
        initial: {
          pathLength: 1,
        },
        animate: {
          pathLength: [1, 0.05, 1],
          transition: {
            pathLength: { duration: 1.5, ease: "easeInOut" },
          },
        },
      };
    });
    return variants;
  })() satisfies Record<string, Variants>,
  "default-2": (() => {
    const variants: Record<string, Variants> = {
      group: {
        initial: {
          scale: 1,
        },
        animate: {
          scale: [1, 1.1, 1],
          transition: {
            ease: "easeInOut",
            duration: 1.5,
          },
        },
      },
      path: {
        initial: {
          strokeOpacity: 0,
        },
      },
    };
    new Array(9).fill(0).forEach((_, i) => {
      variants[`path${i + 1}`] = {
        initial: {
          pathLength: 1,
        },
        animate: {
          pathLength: [1, 0.05, 1],
          transition: {
            pathLength: { duration: 1.5, ease: "easeInOut" },
          },
        },
      };
    });
    return variants;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, className, ...props }: FingerprintProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      animate={controls}
      className={cn(pathClassName, className)}
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
        d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4 M14 13.12c0 2.38 0 6.38-1 8.88 M17.29 21.02c.12-.6.43-2.3.5-3.02 M2 12a10 10 0 0 1 18-6 M2 16h.01 M21.8 16c.2-2 .131-5.354 0-6 M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2 M8.65 22c.21-.66.45-1.32.57-2 M9 6.8a6 6 0 0 1 9 5.2v2"
        initial="initial"
        stroke="currentColor"
        variants={variants.path}
      />
      <motion.path
        animate={controls}
        d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M14 13.12c0 2.38 0 6.38-1 8.88"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M17.29 21.02c.12-.6.43-2.3.5-3.02"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M2 12a10 10 0 0 1 18-6"
        initial="initial"
        variants={variants.path4}
      />
      <motion.path
        animate={controls}
        d="M2 16h.01"
        initial="initial"
        variants={variants.path5}
      />
      <motion.path
        animate={controls}
        d="M21.8 16c.2-2 .131-5.354 0-6"
        initial="initial"
        variants={variants.path6}
      />
      <motion.path
        animate={controls}
        d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
        initial="initial"
        variants={variants.path7}
      />
      <motion.path
        animate={controls}
        d="M8.65 22c.21-.66.45-1.32.57-2"
        initial="initial"
        variants={variants.path8}
      />
      <motion.path
        animate={controls}
        d="M9 6.8a6 6 0 0 1 9 5.2v2"
        initial="initial"
        variants={variants.path9}
      />
    </motion.svg>
  );
}

function Fingerprint(props: FingerprintProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Fingerprint,
  Fingerprint as FingerprintIcon,
  type FingerprintProps,
  type FingerprintProps as FingerprintIconProps,
};
