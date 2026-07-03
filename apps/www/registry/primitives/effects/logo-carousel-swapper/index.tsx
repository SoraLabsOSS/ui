// biome-ignore-all lint/performance/noImgElement: Motion animates filter, opacity, and y on native img elements.
// biome-ignore-all lint/correctness/useImageSize: Slot containers use fixed dimensions; logos are object-contain.
// biome-ignore-all lint/suspicious/noArrayIndexKey: Column slots are fixed-position and never reorder.
"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from "react";

const DEFAULT_INTERVAL_MS = 3000;
const DEFAULT_STAGGER_S = 0.14;
const DEFAULT_COLUMNS = 4;
const EXIT_DURATION_S = 0.55;
const ENTER_DURATION_S = 0.7;
/** Enter overlaps exit so the incoming logo "pushes" the outgoing one. */
const ENTER_OVERLAP_S = 0.14;

const MOTION_BLUR = "blur(3px)";

/** Minimum rendered logo footprint on narrow viewports (72×76px). */
const MOBILE_LOGO_SIZE_CLASSES =
  "max-sm:h-[76px] max-sm:min-h-[76px] max-sm:w-[72px] max-sm:min-w-[72px] max-sm:max-h-[76px] max-sm:max-w-[72px]";

type LogoCarouselSize = "default" | "lg" | "sm";

/** Vertical travel per size — kept within slot height when combined with overflow clipping. */
const MOTION_OFFSET_Y = {
  default: { enter: 18, exit: -18 },
  lg: { enter: 22, exit: -22 },
  sm: { enter: 14, exit: -14 },
} as const satisfies Record<LogoCarouselSize, { enter: number; exit: number }>;

function motionOffsetForSize(
  size: VariantProps<typeof logoCarouselSwapperSlotVariants>["size"]
) {
  return MOTION_OFFSET_Y[(size ?? "default") as LogoCarouselSize];
}

function enterFrom(offsetY: number) {
  return {
    filter: MOTION_BLUR,
    opacity: 0,
    y: offsetY,
    z: 0,
  } as const;
}

const ENTER_TO = {
  filter: "blur(0px)",
  opacity: 1,
  y: 0,
  z: 0,
} as const;

function exitTo(offsetY: number) {
  return {
    filter: MOTION_BLUR,
    opacity: 0,
    y: offsetY,
    z: 0,
  } as const;
}

/** GSAP power3.in — accelerates out quickly. */
const EXIT_EASE = [0.55, 0.055, 0.675, 0.19] as const;
/** GSAP power4.out — snappy approach, soft landing. */
const ENTER_EASE = [0.165, 0.84, 0.44, 1] as const;

const logoCarouselSwapperVariants = cva("w-full max-w-full overflow-hidden", {
  variants: {
    align: {
      center: "",
      end: "",
      start: "",
    },
    size: {
      default: "",
      lg: "",
      sm: "",
    },
  },
  defaultVariants: {
    align: "center",
    size: "default",
  },
});

const logoCarouselSwapperRowVariants = cva(
  [
    "grid w-full min-w-0 max-w-full grid-cols-2 items-center overflow-hidden py-4",
    "sm:flex sm:flex-row sm:py-6 md:py-8",
  ].join(" "),
  {
    variants: {
      align: {
        center: "justify-items-center sm:justify-center",
        end: "justify-items-end sm:justify-end",
        start: "justify-items-start sm:justify-start",
      },
      size: {
        default: "gap-3 sm:gap-6 md:gap-10",
        lg: "gap-3 sm:gap-8 md:gap-12",
        sm: "gap-2 sm:gap-4 md:gap-6",
      },
    },
    defaultVariants: {
      align: "center",
      size: "default",
    },
  }
);

const logoCarouselSwapperSlotVariants = cva(
  [
    "relative isolate grid place-items-center overflow-hidden",
    "max-sm:h-[76px] max-sm:min-h-[76px] max-sm:w-full",
    "sm:min-w-0 sm:flex-1 sm:basis-0",
  ].join(" "),
  {
    variants: {
      size: {
        default: "sm:h-14 md:h-16",
        lg: "sm:h-16 md:h-20",
        sm: "sm:h-12 md:h-14",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const logoCarouselSwapperMotionLayerVariants = cva(
  "absolute inset-0 grid place-items-center will-change-[transform,opacity,filter] [transform:translateZ(0)]"
);

const logoCarouselSwapperImageVariants = cva(
  [
    "pointer-events-none select-none object-contain",
    MOBILE_LOGO_SIZE_CLASSES,
    "sm:max-h-[70%] sm:w-auto sm:max-w-[80%]",
  ].join(" "),
  {
    variants: {
      monochrome: {
        false: "",
        true: "brightness-0 dark:invert",
      },
      size: {
        default: "sm:max-h-8 md:max-h-10",
        lg: "sm:max-h-10 md:max-h-12",
        sm: "sm:max-h-7 md:max-h-8",
      },
    },
    defaultVariants: {
      monochrome: false,
      size: "default",
    },
  }
);

export interface LogoCarouselSwapperItem {
  alt: string;
  src: string;
}

export type LogoCarouselSwapperRow = LogoCarouselSwapperItem[];

export interface LogoCarouselSwapperProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof logoCarouselSwapperVariants> {
  columns?: number;
  interval?: number;
  monochrome?: boolean;
  rows: LogoCarouselSwapperRow[];
  stagger?: number;
}

function normalizeRows(
  rows: LogoCarouselSwapperRow[],
  columns: number
): LogoCarouselSwapperRow[] {
  return rows
    .map((row) => {
      const next = row.slice(0, columns);

      while (next.length < columns) {
        const fallback = row[next.length % Math.max(row.length, 1)];
        if (!fallback) {
          break;
        }
        next.push(fallback);
      }

      return next;
    })
    .filter((row) => row.length === columns && row.every((item) => item.src));
}

interface LogoSlotProps {
  columnIndex: number;
  item: LogoCarouselSwapperItem;
  monochrome: boolean;
  reduceMotion: boolean | null;
  rowKey: number;
  size: VariantProps<typeof logoCarouselSwapperSlotVariants>["size"];
  stagger: number;
}

function LogoSlot({
  columnIndex,
  item,
  monochrome,
  reduceMotion,
  rowKey,
  size,
  stagger,
}: LogoSlotProps) {
  const exitDelay = columnIndex * stagger;
  const enterDelay = exitDelay + EXIT_DURATION_S - ENTER_OVERLAP_S;
  const { enter: enterOffsetY, exit: exitOffsetY } = motionOffsetForSize(size);

  if (reduceMotion) {
    return (
      <div className={logoCarouselSwapperSlotVariants({ size })} data-logo-slot>
        <img
          alt={item.alt}
          className={logoCarouselSwapperImageVariants({ monochrome, size })}
          draggable={false}
          src={item.src}
        />
      </div>
    );
  }

  return (
    <div className={logoCarouselSwapperSlotVariants({ size })} data-logo-slot>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          animate={{
            ...ENTER_TO,
            transition: {
              delay: enterDelay,
              duration: ENTER_DURATION_S,
              ease: ENTER_EASE,
            },
          }}
          className={logoCarouselSwapperMotionLayerVariants()}
          exit={{
            ...exitTo(exitOffsetY),
            transition: {
              delay: exitDelay,
              duration: EXIT_DURATION_S,
              ease: EXIT_EASE,
            },
          }}
          initial={enterFrom(enterOffsetY)}
          key={`${rowKey}-${item.src}`}
        >
          <img
            alt={item.alt}
            className={logoCarouselSwapperImageVariants({ monochrome, size })}
            draggable={false}
            src={item.src}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function LogoCarouselSwapper({
  align,
  className,
  columns = DEFAULT_COLUMNS,
  interval = DEFAULT_INTERVAL_MS,
  monochrome = false,
  rows,
  size,
  stagger = DEFAULT_STAGGER_S,
  ...props
}: LogoCarouselSwapperProps) {
  const [rowIndex, setRowIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const normalizedRows = useMemo(
    () => normalizeRows(rows, columns),
    [columns, rows]
  );

  const activeRow = normalizedRows[rowIndex] ?? [];

  useEffect(() => {
    if (reduceMotion) {
      setRowIndex(0);
      return;
    }

    if (normalizedRows.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRowIndex((current) => (current + 1) % normalizedRows.length);
    }, interval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [interval, normalizedRows.length, reduceMotion]);

  if (activeRow.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(logoCarouselSwapperVariants({ align, size }), className)}
      {...props}
    >
      <div
        aria-hidden={props["aria-label"] ? undefined : true}
        className={logoCarouselSwapperRowVariants({ align, size })}
      >
        {activeRow.map((item, columnIndex) => (
          <LogoSlot
            columnIndex={columnIndex}
            item={item}
            key={`logo-slot-${columnIndex}`}
            monochrome={monochrome}
            reduceMotion={reduceMotion}
            rowKey={rowIndex}
            size={size}
            stagger={stagger}
          />
        ))}
      </div>
    </div>
  );
}
