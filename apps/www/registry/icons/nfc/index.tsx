"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type NfcProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 4; i++) {
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

function IconComponent({ size, ...props }: NfcProps) {
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
        d="M6 8.32a7.43 7.43 0 0 1 0 7.36"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M16.37 2a20.16 20.16 0 0 1 0 20"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function Nfc(props: NfcProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Nfc,
  Nfc as NfcIcon,
  type NfcProps,
  type NfcProps as NfcIconProps,
};
