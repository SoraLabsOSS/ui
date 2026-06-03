"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type HouseWifiProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path4: {},
    };

    for (let i = 1; i <= 3; i++) {
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

function IconComponent({ size, ...props }: HouseWifiProps) {
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
      <motion.path
        animate={controls}
        d="M12 17h.01"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M9.5 13.866a4 4 0 0 1 5 .01"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M7 10.754a8 8 0 0 1 10 0"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function HouseWifi(props: HouseWifiProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  HouseWifi,
  HouseWifi as HouseWifiIcon,
  type HouseWifiProps,
  type HouseWifiProps as HouseWifiIconProps,
};
