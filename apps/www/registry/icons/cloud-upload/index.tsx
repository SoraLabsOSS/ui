"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type CloudUploadProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        y: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
      animate: {
        y: -2,
        transition: { duration: 0.3, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -2, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CloudUploadProps) {
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
          d="M12 13v8"
          initial="initial"
          variants={variants.path1}
        />
        <motion.path
          animate={controls}
          d="m8 17 4-4 4 4"
          initial="initial"
          variants={variants.path2}
        />
      </motion.g>
      <motion.path
        animate={controls}
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function CloudUpload(props: CloudUploadProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CloudUpload,
  CloudUpload as CloudUploadIcon,
  type CloudUploadProps,
  type CloudUploadProps as CloudUploadIconProps,
};
