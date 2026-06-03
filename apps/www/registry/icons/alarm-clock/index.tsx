"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type AlarmClockProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [
          0,
          "2%",
          "-2%",
          "2%",
          "-2%",
          "2%",
          "-2%",
          "2%",
          "-2%",
          "2%",
          "-2%",
          0,
        ],
        y: [
          0,
          "-5%",
          "-5%",
          "-5%",
          "-5%",
          "-5%",
          "-5%",
          "-5%",
          "-5%",
          "-5%",
          0,
        ],
        transition: {
          ease: "easeInOut",
          duration: 0.6,
        },
      },
    },
    circle: {},
    line1: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 5, -5, 5, -5, 5, -5, 5, -5, 5, -5, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "top left",
        rotate: [0, 5, -5, 5, -5, 5, -5, 5, -5, 5, -5, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0],
        transition: { ease: "easeInOut", duration: 0.6 },
      },
    },
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
  "default-loop": {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: ["2%", "-2%", "2%", "-2%", "2%", "-2%", "2%", "-2%", "2%", "-2%"],
        y: "-5%",
        transition: {
          duration: 0.5,
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          },
          y: {
            duration: 0.2,
          },
        },
      },
    },
    circle: {},
    line1: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "bottom left",
        rotate: [0, 10, -10, 10, -10, 10, -10, 10, -10, 10, -10, 0],
        transition: {
          duration: 0.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    line2: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: "top left",
        rotate: [0, 10, -10, 10, -10, 10, -10, 10, -10, 10, -10, 0],
        transition: {
          duration: 0.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    path1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0],
        transition: {
          duration: 0.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    path2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0],
        transition: {
          duration: 0.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AlarmClockProps) {
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
      variants={variants.group}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.circle
        animate={controls}
        cx={12}
        cy={13}
        initial="initial"
        r={8}
        variants={variants.circle}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line1}
        x1={12}
        x2={12}
        y1={9}
        y2={13}
      />
      <motion.line
        animate={controls}
        initial="initial"
        variants={variants.line2}
        x1={14}
        x2={12}
        y1={15}
        y2={13}
      />
      <motion.path
        animate={controls}
        d="M5 3 2 6"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="m22 6-3-3"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M6.38 18.7 4 21"
        initial="initial"
        variants={variants.path3}
      />
      <motion.path
        animate={controls}
        d="M17.64 18.67 20 21"
        initial="initial"
        variants={variants.path4}
      />
    </motion.svg>
  );
}

function AlarmClock(props: AlarmClockProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  AlarmClock,
  AlarmClock as AlarmClockIcon,
  type AlarmClockProps,
  type AlarmClockProps as AlarmClockIconProps,
  animations,
};
