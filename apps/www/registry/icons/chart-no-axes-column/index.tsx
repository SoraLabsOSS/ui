"use client";

import { motion, type Variants } from "motion/react";

import {
  getVariants,
  type IconProps,
  IconWrapper,
  useAnimateIconContext,
} from "@/registry/icons/icon";

type ChartNoAxesColumnProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 3; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1 },
        animate: {
          opacity: [0, 1],
          pathLength: [0, 1],
          transition: {
            ease: "easeInOut",
            duration: 0.4,
            delay: (i - 1) * 0.3,
          },
        },
      };
    }

    return animation as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
  "default-loop": (() => {
    const n = 3;
    const delayStep = 0.3;
    const segDuration = 0.4;

    const startOut = (i: number) => (n - i) * delayStep;
    const endOut = (i: number) => startOut(i) + segDuration;

    const outTotal = Math.max(
      ...Array.from({ length: n }, (_, k) => endOut(k + 1))
    );

    const startIn = (i: number) => outTotal + (i - 1) * delayStep;
    const endIn = (i: number) => startIn(i) + segDuration;

    const totalDuration = Math.max(
      ...Array.from({ length: n }, (_, k) => endIn(k + 1))
    );

    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= n; i++) {
      const tSO = startOut(i) / totalDuration;
      const tEO = endOut(i) / totalDuration;
      const tSI = startIn(i) / totalDuration;
      const tEI = endIn(i) / totalDuration;

      animation[`path${i}`] = {
        initial: { opacity: 1, pathLength: 1 },
        animate: {
          pathLength: [1, 1, 0, 0, 1],
          opacity: [1, 1, 0, 0, 1],
          transition: {
            ease: "easeInOut",
            duration: totalDuration,
            times: [0, tSO, tEO, tSI, tEI],
          },
        },
      };
    }

    return animation as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
  decreasing: {
    path1: {
      initial: { d: "M5 21V15" },
      animate: {
        d: "M5 21V15",
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
    path2: {
      initial: { d: "M12 21V3" },
      animate: {
        d: "M12 21V9",
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
    path3: {
      initial: { d: "M19 21V9" },
      animate: {
        d: "M19 21V3",
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
  increasing: {
    path1: {
      initial: { d: "M5 21V15" },
      animate: {
        d: "M5 21V3",
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
    path2: {
      initial: { d: "M12 21V3" },
      animate: {
        d: "M12 21V9",
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
    path3: {
      initial: { d: "M19 21V9" },
      animate: {
        d: "M19 21V15",
        transition: { duration: 0.5, ease: "easeInOut" },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChartNoAxesColumnProps) {
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
        d="M5 21V15"
        initial="initial"
        variants={variants.path1}
      />
      <motion.path
        animate={controls}
        d="M12 21V3"
        initial="initial"
        variants={variants.path2}
      />
      <motion.path
        animate={controls}
        d="M19 21V9"
        initial="initial"
        variants={variants.path3}
      />
    </motion.svg>
  );
}

function ChartNoAxesColumn(props: ChartNoAxesColumnProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChartNoAxesColumn,
  ChartNoAxesColumn as ChartNoAxesColumnIcon,
  type ChartNoAxesColumnProps,
  type ChartNoAxesColumnProps as ChartNoAxesColumnIconProps,
};
