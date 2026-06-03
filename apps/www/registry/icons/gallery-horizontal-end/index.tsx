"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type GalleryVerticalEndProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      rect: {},
    };

    for (let i = 1; i <= 2; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1, y: 0 },
        animate: {
          opacity: [0, 1],
          scale: [0.8, 1],
          y: [2 * i, 0],
          transition: {
            delay: 0.2 * (2 - i),
            type: "spring",
            stiffness: 150,
            damping: 15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,

  zoom: (() => {
    const animation: Record<string, Variants> = {
      rect: {
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
            },
            scale: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.2,
            },
          },
        },
      },
    };

    for (let i = 1; i <= 2; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, transform: "translateY(0) scale(1)" },
        animate: {
          opacity: 0,
          transform: `translateY(${(3 - i) * 3}px) scale(0)`,
          transition: {
            transform: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.8 - 0.2 * i,
            },
            opacity: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.8 - 0.2 * i,
            },
            scale: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.8 - 0.2 * i,
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,

  collapse: {
    rect: {
      initial: { y: 0 },
      animate: {
        y: -4,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
    path1: {
      initial: { y: 0 },
      animate: {
        y: 4,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GalleryVerticalEndProps) {
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
        d="M7 2h10"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M5 6h14"
        initial="initial"
        variants={variants.path2}
      />
      <motion.rect
        animate={controls}
        height="12"
        initial="initial"
        rx="2"
        variants={variants.rect}
        width="18"
        x="3"
        y="10"
      />
    </motion.svg>
  );
}

function GalleryVerticalEnd(props: GalleryVerticalEndProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  GalleryVerticalEnd,
  GalleryVerticalEnd as GalleryVerticalEndIcon,
  type GalleryVerticalEndProps,
  type GalleryVerticalEndProps as GalleryVerticalEndIconProps,
};
