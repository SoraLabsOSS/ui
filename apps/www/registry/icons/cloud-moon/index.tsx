"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CloudMoonProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -1, 1, 0],
        y: [0, -1, 1, 0],
        transition: {
          duration: 1.4,
          ease: "easeInOut",
        },
      },
    },
    path2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 6, -8, 0],
        transition: {
          duration: 1.4,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudMoonProps) {
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
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.path
        animate={controls}
        d="M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function CloudMoon(props: CloudMoonProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudMoon,
  CloudMoon as CloudMoonIcon,
  type CloudMoonProps,
  type CloudMoonProps as CloudMoonIconProps,
};
