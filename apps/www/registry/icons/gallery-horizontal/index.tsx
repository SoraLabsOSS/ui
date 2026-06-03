"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type GalleryHorizontalProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      rect: {},
    };

    for (let i = 1; i <= 2; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1, x: 0 },
        animate: {
          opacity: [0, 1],
          scale: [0.8, 1],
          x: [4 * (-1) ** (i + 1), 0],
          transition: {
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
        initial: { opacity: 1, transform: "translateX(0) scale(1)" },
        animate: {
          opacity: 0,
          transform: `translateX(${8 * (-1) ** (i + 1)}px) scale(0)`,
          transition: {
            transform: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.4,
            },
            opacity: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.4,
            },
            scale: {
              duration: 0.2,
              ease: "easeInOut",
              repeat: 1,
              repeatType: "reverse",
              repeatDelay: 0.4,
            },
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,

  collapse: {
    rect: {},
    path1: {
      initial: { x: 0, scaleY: 1 },
      animate: {
        x: 4,
        scaleY: 0.8,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
    path2: {
      initial: { x: 0, scaleY: 1 },
      animate: {
        x: -4,
        scaleY: 0.8,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GalleryHorizontalProps) {
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
        d="M2 3v18"
        initial="initial"
        variants={variants.path1}
      />
      <motion.rect
        animate={controls}
        height="18"
        initial="initial"
        rx="2"
        variants={variants.rect}
        width="12"
        x="6"
        y="3"
      />
      <motion.path
        animate={controls}
        d="M22 3v18"
        initial="initial"
        variants={variants.path2}
      />
    </motion.svg>
  );
}

function GalleryHorizontal(props: GalleryHorizontalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  GalleryHorizontal,
  GalleryHorizontal as GalleryHorizontalIcon,
  type GalleryHorizontalProps,
  type GalleryHorizontalProps as GalleryHorizontalIconProps,
};
