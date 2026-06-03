"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CloudHailProps = IconProps<keyof typeof animations>;

const hailAnimation: Variants = {
  initial: { opacity: 1 },
  animate: (i = 0) => ({
    opacity: [1, 0.4, 1],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
      delay: i * 0.2,
    },
  }),
};

const animations = {
  default: {
    group: {
      initial: {},
      animate: {},
    },
    path1: {},
    path2: hailAnimation,
    path3: hailAnimation,
    path4: hailAnimation,
    path5: hailAnimation,
    path6: hailAnimation,
    path7: hailAnimation,
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudHailProps) {
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
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        initial="initial"
        variants={variants.path1}
      />
      <motion.g animate={controls} initial="initial" variants={variants.group}>
        <motion.path custom={0} d="M8 14v2" variants={variants.path2} />
        <motion.path custom={1} d="M12 22h.01" variants={variants.path3} />
        <motion.path custom={2} d="M16 14v2" variants={variants.path4} />
        <motion.path custom={3} d="M12 16v2" variants={variants.path7} />
        <motion.path custom={4} d="M16 20h.01" variants={variants.path6} />
        <motion.path custom={5} d="M8 20h.01" variants={variants.path5} />
      </motion.g>
    </motion.svg>
  );
}

function CloudHail(props: CloudHailProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudHail,
  CloudHail as CloudHailIcon,
  type CloudHailProps,
  type CloudHailProps as CloudHailIconProps,
};
