"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CogProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180],
        transition: {
          duration: 1.25,
          ease: "easeInOut",
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
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180, 270, 360],
        transition: {
          duration: 2.5,
          ease: "easeInOut",
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
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
          ease: "linear",
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
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CogProps) {
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
          d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
          initial="initial"
          variants={variants.path2}
        />
        <motion.path
          animate={controls}
          d="M12 2v2"
          initial="initial"
          variants={variants.path3}
        />
        <motion.path
          animate={controls}
          d="M12 22v-2"
          initial="initial"
          variants={variants.path4}
        />
        <motion.path
          animate={controls}
          d="m17 20.66-1-1.73"
          initial="initial"
          variants={variants.path5}
        />
        <motion.path
          animate={controls}
          d="M11 10.27 7 3.34"
          initial="initial"
          variants={variants.path6}
        />
        <motion.path
          animate={controls}
          d="m20.66 17-1.73-1"
          initial="initial"
          variants={variants.path7}
        />
        <motion.path
          animate={controls}
          d="m3.34 7 1.73 1"
          initial="initial"
          variants={variants.path8}
        />
        <motion.path
          animate={controls}
          d="M14 12h8"
          initial="initial"
          variants={variants.path9}
        />
        <motion.path
          animate={controls}
          d="M2 12h2"
          initial="initial"
          variants={variants.path10}
        />
        <motion.path
          animate={controls}
          d="m20.66 7-1.73 1"
          initial="initial"
          variants={variants.path11}
        />
        <motion.path
          animate={controls}
          d="m3.34 17 1.73-1"
          initial="initial"
          variants={variants.path12}
        />
        <motion.path
          animate={controls}
          d="m17 3.34-1 1.73"
          initial="initial"
          variants={variants.path13}
        />
        <motion.path
          animate={controls}
          d="m11 13.73-4 6.93"
          initial="initial"
          variants={variants.path14}
        />
      </motion.g>
    </motion.svg>
  );
}

function Cog(props: CogProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cog,
  Cog as CogIcon,
  type CogProps,
  type CogProps as CogIconProps,
};
