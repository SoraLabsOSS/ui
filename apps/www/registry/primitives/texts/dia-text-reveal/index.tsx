"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  animate,
  type MotionProps,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type EaseValue =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "anticipate"
  | readonly [number, number, number, number]
  | ((t: number) => number);

export interface DiaTextRevealHandle {
  /** (Re)starts the sweep immediately, ignoring startOnView/inView gating. */
  play: () => void;
  /** Resets to the first phrase and starts the sweep immediately. */
  replay: () => void;
}

export interface DiaTextRevealProps {
  /** Render as a different element/component instead of `span`. */
  as?: ElementType;
  className?: string;
  colors?: string[];
  delay?: number;
  /** Sweep direction across the text. @default "ltr" */
  direction?: "ltr" | "rtl";
  duration?: number;
  /** Easing for the reveal sweep. */
  ease?: EaseValue;
  fadeDuration?: number;
  /** Easing for the fade-out between repeats. */
  fadeEase?: EaseValue;
  /** Lock width to the longest phrase so rotating text does not shift layout. */
  fixedWidth?: boolean;
  holdDuration?: number;
  inViewMargin?:
    | `${number}px`
    | `${number}px ${number}px`
    | `${number}px ${number}px ${number}px`
    | `${number}px ${number}px ${number}px ${number}px`;
  /** Called every time a phrase finishes revealing (fully visible). */
  onComplete?: () => void;
  once?: boolean;
  ref?: Ref<DiaTextRevealHandle>;
  repeat?: boolean;
  repeatDelay?: number;
  startOnView?: boolean;
  text: string | string[];
  /** Final revealed text color. @default "currentColor" */
  textColor?: string;
}

const DEFAULT_EASE: EaseValue = [0.23, 1, 0.32, 1];

function buildGradient(colors: string[], textColor: string, angle: number) {
  const bandStart = 40;
  const bandEnd = 60;
  const stops = colors.map((color, index) => {
    const t = colors.length === 1 ? 0.5 : index / (colors.length - 1);
    const pct = bandStart + t * (bandEnd - bandStart);
    return `${color} ${pct}%`;
  });

  // First third = final text color, middle = chromatic ribbon, last third =
  // transparent (hidden). Start at background-position 100% (transparent),
  // animate to 0%. `angle` flips which edge the reveal starts from.
  return `linear-gradient(${angle}deg, ${textColor} 0%, ${textColor} 33.33%, ${stops.join(", ")}, transparent 66.67%, transparent 100%)`;
}

function measureMaxWidth(element: HTMLElement, texts: string[]) {
  const ghost = element.cloneNode() as HTMLElement;

  Object.assign(ghost.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    width: "auto",
    whiteSpace: "nowrap",
  });

  element.parentElement?.appendChild(ghost);

  let max = 0;

  for (const entry of texts) {
    ghost.textContent = entry;
    max = Math.max(max, ghost.getBoundingClientRect().width);
  }

  ghost.remove();
  return max;
}

export function DiaTextReveal({
  text,
  colors = ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe", "#0358f7"],
  textColor = "currentColor",
  direction = "ltr",
  duration = 1.5,
  delay = 0,
  ease = DEFAULT_EASE,
  fadeEase = "easeInOut",
  repeat = false,
  repeatDelay = 0.5,
  holdDuration = 1,
  fadeDuration = 0.6,
  fixedWidth = false,
  startOnView = true,
  once = true,
  inViewMargin = "0px",
  onComplete,
  as: Component = "span",
  className,
  ref: controlRef,
}: DiaTextRevealProps) {
  const elementRef = useRef<HTMLElement>(null);
  const isInView = useInView(elementRef, {
    once,
    margin: inViewMargin,
  });
  const prefersReducedMotion = useReducedMotion();
  const canAnimate = !prefersReducedMotion && (!startOnView || isInView);

  const texts = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const isMulti = texts.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const [lockedWidth, setLockedWidth] = useState<number | undefined>();
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // sweep: 100 = hidden, 0 = fully revealed. Position and opacity are driven
  // independently so the gradient only ever resets back to 100 while the
  // text is fully invisible — the reverse sweep is never actually seen.
  const sweep = useMotionValue(100);
  const textOpacity = useMotionValue(0);
  const backgroundPosition = useTransform(sweep, (v) => `${v}% 50%`);
  const angle = direction === "rtl" ? 270 : 90;

  useLayoutEffect(() => {
    const element = elementRef.current;

    if (!(element && fixedWidth && isMulti)) {
      setLockedWidth(undefined);
      return;
    }

    setLockedWidth(measureMaxWidth(element, texts));
  }, [fixedWidth, isMulti, texts]);

  const clearCycle = useCallback(() => {
    sweep.stop();
    textOpacity.stop();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = undefined;
  }, [sweep, textOpacity]);

  const playRef = useRef<() => void>(() => undefined);

  playRef.current = () => {
    clearCycle();
    sweep.set(100);
    textOpacity.set(0);

    animate(sweep, 0, { duration, delay, ease });
    animate(textOpacity, 1, {
      duration,
      delay,
      ease,
      onComplete() {
        onComplete?.();

        if (!repeat) {
          return;
        }

        timerRef.current = setTimeout(() => {
          animate(textOpacity, 0, {
            duration: fadeDuration,
            ease: fadeEase,
            onComplete() {
              indexRef.current = (indexRef.current + 1) % texts.length;
              setActiveIndex(indexRef.current);
              sweep.set(100);

              timerRef.current = setTimeout(() => {
                playRef.current();
              }, repeatDelay * 1000);
            },
          });
        }, holdDuration * 1000);
      },
    });
  };

  const replay = useCallback(() => {
    if (prefersReducedMotion) {
      return;
    }

    indexRef.current = 0;
    setActiveIndex(0);
    playRef.current();
  }, [prefersReducedMotion]);

  const play = useCallback(() => {
    if (prefersReducedMotion) {
      return;
    }

    playRef.current();
  }, [prefersReducedMotion]);

  useImperativeHandle(controlRef, () => ({ play, replay }), [play, replay]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run only when visibility or text list changes
  useEffect(() => {
    indexRef.current = 0;
    setActiveIndex(0);
    clearCycle();
    sweep.set(100);
    textOpacity.set(0);

    if (canAnimate) {
      playRef.current();
    }

    return clearCycle;
  }, [canAnimate, texts]);

  const MotionComponent = useMemo(
    () =>
      motion.create(Component as never) as ComponentType<
        MotionProps & {
          children?: ReactNode;
          className?: string;
          ref?: Ref<HTMLElement>;
        }
      >,
    [Component]
  );
  const resolvedColor = textColor === "currentColor" ? "inherit" : textColor;

  return (
    <MotionComponent
      className={cn("inline-block bg-clip-text", className)}
      ref={elementRef}
      style={
        prefersReducedMotion
          ? {
              color: resolvedColor,
              WebkitTextFillColor: "transparent",
              backgroundImage: buildGradient(colors, textColor, angle),
              backgroundSize: "300% 100%",
              backgroundPosition: "0% 50%",
              opacity: 1,
              ...(lockedWidth != null && {
                width: lockedWidth,
                whiteSpace: "nowrap",
              }),
            }
          : {
              color: resolvedColor,
              WebkitTextFillColor: "transparent",
              backgroundImage: buildGradient(colors, textColor, angle),
              backgroundSize: "300% 100%",
              backgroundPosition,
              opacity: textOpacity,
              ...(lockedWidth != null && {
                width: lockedWidth,
                whiteSpace: "nowrap",
              }),
            }
      }
    >
      {prefersReducedMotion ? texts[0] : texts[activeIndex]}
    </MotionComponent>
  );
}
