/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Hover-driven image reveal card. */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: Touch mode uses button semantics. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Keyboard activation is enabled for touch. */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: Pixel grid positions are stable. */

"use client";

import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_IMAGE_SRC =
  "https://plus.unsplash.com/premium_photo-1674583794341-50bb046c49a7?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const DEFAULT_ACTIVE_SRC =
  "https://images.unsplash.com/photo-1780269579991-79bc18ee6f56?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const DEFAULT_PIXEL_COLOR = "#ff4c24";

const pixelatedImageRevealVariants = cva(
  "relative w-full max-w-full overflow-hidden rounded-lg bg-neutral-800",
  {
    variants: {
      aspect: {
        square: "aspect-square",
        video: "aspect-video",
        auto: "",
      },
    },
    defaultVariants: {
      aspect: "square",
    },
  }
);

const pixelatedImageRevealLayerVariants = cva(
  "absolute inset-0 h-full w-full object-cover"
);

const pixelatedImageRevealPixelVariants = cva("absolute will-change-[opacity]");

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    result[index] = result[swapIndex] as T;
    result[swapIndex] = current as T;
  }

  return result;
}

function createRandomStaggerDelays(
  count: number,
  stepDuration: number
): number[] {
  const order = shuffle([...new Array(count).keys()]);
  const stagger = stepDuration / count;
  const delays = new Array<number>(count).fill(0);

  for (let position = 0; position < count; position++) {
    delays[order[position] as number] = position * stagger;
  }

  return delays;
}

function useCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const update = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isCoarsePointer;
}

export interface PixelatedImageRevealProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof pixelatedImageRevealVariants> {
  /** Hover / active image source. */
  activeSrc?: string;
  /** Accessible label for both images. */
  alt?: string;
  /** Default image source. */
  defaultSrc?: string;
  /** Grid columns and rows (N×N pixels). */
  gridSize?: number;
  /** Override each pixel cell. */
  pixelClassName?: string;
  /**
   * Fill color for each pixel cell during the reveal transition.
   * @default "#ff4c24"
   */
  pixelColor?: string;
  /**
   * Duration of each reveal step in seconds.
   * @default 0.3
   */
  stepDuration?: number;
}

function PixelatedImageReveal({
  aspect = "square",
  stepDuration = 0.3,
  gridSize = 7,
  defaultSrc = DEFAULT_IMAGE_SRC,
  activeSrc = DEFAULT_ACTIVE_SRC,
  alt = "",
  pixelColor = DEFAULT_PIXEL_COLOR,
  className,
  pixelClassName,
  ...props
}: PixelatedImageRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const [isRevealed, setIsRevealed] = useState(false);
  const [pixelsVisible, setPixelsVisible] = useState(false);
  const [pixelDelays, setPixelDelays] = useState<number[]>([]);
  const activeIntentRef = useRef(false);
  const generationRef = useRef(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const pixelCount = gridSize * gridSize;
  const pixelSizePercent = 100 / gridSize;

  const pixelIndexes = useMemo(
    () => [...new Array(pixelCount).keys()],
    [pixelCount]
  );

  const clearScheduledTimeouts = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      clearTimeout(timeoutId);
    }

    timeoutIdsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback(
    (callback: () => void, delayMs: number) => {
      const timeoutId = setTimeout(callback, delayMs);
      timeoutIdsRef.current.push(timeoutId);
    },
    []
  );

  const runReveal = useCallback(
    (activate: boolean) => {
      activeIntentRef.current = activate;
      clearScheduledTimeouts();
      const generation = ++generationRef.current;

      if (prefersReducedMotion) {
        setPixelsVisible(false);
        setIsRevealed(activate);
        return;
      }

      setPixelsVisible(false);
      setPixelDelays(createRandomStaggerDelays(pixelCount, stepDuration));

      requestAnimationFrame(() => {
        if (generation !== generationRef.current) {
          return;
        }

        setPixelsVisible(true);
      });

      scheduleTimeout(() => {
        if (generation !== generationRef.current) {
          return;
        }

        setIsRevealed(activate);
      }, stepDuration * 1000);

      scheduleTimeout(() => {
        if (generation !== generationRef.current) {
          return;
        }

        setPixelDelays(createRandomStaggerDelays(pixelCount, stepDuration));
        setPixelsVisible(false);
      }, stepDuration * 1000);
    },
    [
      clearScheduledTimeouts,
      pixelCount,
      prefersReducedMotion,
      scheduleTimeout,
      stepDuration,
    ]
  );

  useEffect(() => clearScheduledTimeouts, [clearScheduledTimeouts]);

  const handlePointerEnter = () => {
    if (isCoarsePointer || activeIntentRef.current) {
      return;
    }

    runReveal(true);
  };

  const handlePointerLeave = () => {
    if (isCoarsePointer || !activeIntentRef.current) {
      return;
    }

    runReveal(false);
  };

  const handleActivate = () => {
    if (!isCoarsePointer) {
      return;
    }

    runReveal(!activeIntentRef.current);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isCoarsePointer) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      className={cn(pixelatedImageRevealVariants({ aspect, className }))}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      {...(isCoarsePointer
        ? {
            "aria-label": alt || "Toggle image reveal",
            role: "button" as const,
            tabIndex: 0,
          }
        : { role: "group" as const })}
      {...props}
    >
      <Image
        alt={alt}
        className={pixelatedImageRevealLayerVariants()}
        fill
        sizes="(max-width: 768px) 100vw, 288px"
        src={defaultSrc}
      />
      <Image
        alt=""
        aria-hidden="true"
        className={cn(
          pixelatedImageRevealLayerVariants(),
          isRevealed ? "opacity-100" : "opacity-0"
        )}
        fill
        sizes="(max-width: 768px) 100vw, 288px"
        src={activeSrc}
      />
      <div aria-hidden="true" className="absolute inset-0">
        {pixelIndexes.map((index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;

          return (
            <motion.div
              animate={{ opacity: pixelsVisible ? 1 : 0 }}
              className={cn(
                pixelatedImageRevealPixelVariants(),
                pixelClassName
              )}
              initial={false}
              key={index}
              style={{
                backgroundColor: pixelColor,
                height: `${pixelSizePercent}%`,
                left: `${col * pixelSizePercent}%`,
                top: `${row * pixelSizePercent}%`,
                width: `${pixelSizePercent}%`,
              }}
              transition={{
                delay: pixelDelays[index] ?? 0,
                duration: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export {
  PixelatedImageReveal,
  pixelatedImageRevealLayerVariants,
  pixelatedImageRevealPixelVariants,
  pixelatedImageRevealVariants,
};
