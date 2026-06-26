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
const EXIT_OFFSET_Y = -25;
const ENTER_OFFSET_Y = 25;

/** GSAP power3.in — accelerates out quickly. */
const EXIT_EASE = [0.55, 0.055, 0.675, 0.19] as const;
/** GSAP power4.out — snappy approach, soft landing. */
const ENTER_EASE = [0.165, 0.84, 0.44, 1] as const;

const ENTER_FROM = {
  filter: MOTION_BLUR,
  opacity: 0,
  y: ENTER_OFFSET_Y,
  z: 0,
} as const;

const ENTER_TO = {
  filter: "blur(0px)",
  opacity: 1,
  y: 0,
  z: 0,
} as const;

const EXIT_TO = {
  filter: MOTION_BLUR,
  opacity: 0,
  y: EXIT_OFFSET_Y,
  z: 0,
} as const;

const logoCarouselSwapperVariants = cva("w-full overflow-visible", {
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
  "flex w-full items-center overflow-visible py-10",
  {
    variants: {
      align: {
        center: "justify-center",
        end: "justify-end",
        start: "justify-start",
      },
      size: {
        default: "gap-8 md:gap-10",
        lg: "gap-10 md:gap-12",
        sm: "gap-5 md:gap-6",
      },
    },
    defaultVariants: {
      align: "center",
      size: "default",
    },
  }
);

const logoCarouselSwapperSlotVariants = cva(
  "relative grid shrink-0 place-items-center overflow-visible",
  {
    variants: {
      size: {
        default: "h-16 w-28",
        lg: "h-20 w-32",
        sm: "h-14 w-24",
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
  "pointer-events-none max-h-[70%] w-auto max-w-[80%] select-none object-contain",
  {
    variants: {
      monochrome: {
        false: "dark:brightness-0 dark:invert",
        true: "brightness-0 dark:invert",
      },
      size: {
        default: "max-h-10",
        lg: "max-h-12",
        sm: "max-h-8",
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
            ...EXIT_TO,
            transition: {
              delay: exitDelay,
              duration: EXIT_DURATION_S,
              ease: EXIT_EASE,
            },
          }}
          initial={ENTER_FROM}
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
    if (normalizedRows.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRowIndex((current) => (current + 1) % normalizedRows.length);
    }, interval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [interval, normalizedRows.length]);

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
