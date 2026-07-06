"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  animate,
  type MotionValue,
  motion,
  type Transition,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
  useEffect,
  useMemo,
  useRef,
} from "react";

// --- formatting -------------------------------------------------------------

type NumberPartType =
  | Exclude<Intl.NumberFormatPartTypes, "minusSign" | "plusSign">
  | "sign"
  | "prefix"
  | "suffix";

interface KeyedDigitPart {
  key: string;
  /** Digit place: 0 = ones, 1 = tens, ... for integer; -1, -2, ... for fraction. */
  pos: number;
  type: "integer" | "fraction";
  value: number;
}

interface KeyedSymbolPart {
  key: string;
  type: Exclude<NumberPartType, "integer" | "fraction">;
  value: string;
}

type KeyedPart = KeyedDigitPart | KeyedSymbolPart;

interface FormattedNumber {
  parts: KeyedPart[];
  value: number;
  valueAsString: string;
}

function generateKeyFactory() {
  const counts: Partial<Record<NumberPartType, number>> = {};
  return (type: NumberPartType) => {
    const next = (counts[type] ?? -1) + 1;
    counts[type] = next;
    return { index: next, key: `${type}:${next}` };
  };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: part-classification switch
function formatToParts(
  value: number,
  formatter: Intl.NumberFormat,
  prefix?: string,
  suffix?: string
): FormattedNumber {
  const rawParts: Array<{
    type: Intl.NumberFormatPartTypes | "prefix" | "suffix";
    value: string;
  }> = formatter.formatToParts(value);
  if (prefix) {
    rawParts.unshift({ type: "prefix", value: prefix });
  }
  if (suffix) {
    rawParts.push({ type: "suffix", value: suffix });
  }

  const pre: KeyedPart[] = [];
  const integerDigits: Array<
    { type: "integer"; value: number } | { type: "group"; value: string }
  > = [];
  const fraction: KeyedPart[] = [];
  const post: KeyedPart[] = [];

  const generateKey = generateKeyFactory();

  let valueAsString = "";
  let seenInteger = false;
  let seenDecimal = false;

  for (const part of rawParts) {
    valueAsString += part.value;

    const type: NumberPartType =
      part.type === "minusSign" || part.type === "plusSign"
        ? "sign"
        : part.type;

    if (type === "integer") {
      seenInteger = true;
      for (const digit of part.value) {
        integerDigits.push({ type: "integer", value: Number(digit) });
      }
    } else if (type === "group") {
      integerDigits.push({ type: "group", value: part.value });
    } else if (type === "decimal") {
      seenDecimal = true;
      fraction.push({
        type: "decimal",
        value: part.value,
        key: generateKey(type).key,
      });
    } else if (type === "fraction") {
      for (const digit of part.value) {
        // Fraction digits are keyed left-to-right, so pos counts down from -1.
        const { index, key } = generateKey(type);
        fraction.push({
          type: "fraction",
          value: Number(digit),
          key,
          pos: -1 - index,
        });
      }
    } else {
      (seenInteger || seenDecimal ? post : pre).push({
        type,
        value: part.value,
        key: generateKey(type).key,
      });
    }
  }

  // Key the integer parts right-to-left, so adding/removing a leading digit
  // (e.g. 99 -> 100) doesn't reshuffle the keys of the digits that didn't change.
  // The right-to-left index also becomes each digit's place (`pos`): ones = 0,
  // tens = 1, etc.
  const integer: KeyedPart[] = [...integerDigits]
    .reverse()
    .map((part) => {
      const { index, key } = generateKey(part.type);
      return part.type === "integer"
        ? { ...part, key, pos: index }
        : { ...part, key };
    })
    .reverse();

  return {
    parts: [...pre, ...integer, ...fraction, ...post],
    valueAsString,
    value,
  };
}

function isDigitPart(part: KeyedPart): part is KeyedDigitPart {
  return part.type === "integer" || part.type === "fraction";
}

// --- trend / digit delta -----------------------------------------------------

export type NumberFlowTrend =
  | number
  | ((prevValue: number, value: number) => number);

function resolveTrend(
  trend: NumberFlowTrend,
  prevValue: number,
  value: number
) {
  return typeof trend === "function" ? trend(prevValue, value) : trend;
}

const DIGIT_LENGTH = 10;

function getDigitDelta(prevValue: number, value: number, trend: number) {
  const diff = value - prevValue;
  const t = trend || Math.sign(diff);
  if (t < 0 && value > prevValue) {
    return value - DIGIT_LENGTH - prevValue;
  }
  if (t > 0 && value < prevValue) {
    return DIGIT_LENGTH - prevValue + value;
  }
  return diff;
}

function mod(a: number, m: number) {
  return ((a % m) + m) % m;
}

/**
 * Ported from the `continuous` plugin (packages/number-flow/src/plugins/continuous.ts).
 * Finds the least-significant digit place where the previous and next number
 * actually differ, so that digits at-or-before that place which happen to
 * hold the same face still spin through a full loop — making the number
 * appear to pass continuously through the values in between, instead of just
 * the changed digits jumping in place.
 */
function computeStartingPos(
  prevParts: KeyedDigitPart[],
  parts: KeyedDigitPart[],
  trend: number
): number | undefined {
  if (!trend) {
    return;
  }
  const firstChangedPrev = prevParts.find(
    (pp) => !parts.some((p) => p.pos === pp.pos && p.value === pp.value)
  );
  const firstChanged = parts.find(
    (p) => !prevParts.some((pp) => p.pos === pp.pos && p.value === pp.value)
  );
  const positions = [firstChangedPrev?.pos, firstChanged?.pos].filter(
    (p): p is number => p != null
  );
  return positions.length ? Math.max(...positions) : undefined;
}

/** Fraction in [-1, 1] of one row that face `n` sits from center. */
function digitFaceOffset(n: number, c: number) {
  const offsetRaw = mod(DIGIT_LENGTH + n - mod(c, DIGIT_LENGTH), DIGIT_LENGTH);
  const offset =
    offsetRaw - DIGIT_LENGTH * Math.floor(offsetRaw / (DIGIT_LENGTH / 2));
  return Math.max(-1, Math.min(1, offset));
}

// --- edge mask (vignette) -------------------------------------------------

/**
 * Ported from the mask recipe in packages/number-flow/src/styles.ts
 * (technique: https://expensive.toys/blog/blur-vignette). Fades the digit
 * row through its top/bottom/corner edges instead of hard-clipping spinning
 * faces, so a digit rolling in/out doesn't look like it's cut off by a box.
 */
const MASK_HEIGHT = "0.25em";
const MASK_WIDTH = "0.5em";
const MASK_CORNER = "#000 0, transparent 71%";

const numberMaskStyle: CSSProperties = {
  WebkitMaskImage: [
    `linear-gradient(to right, transparent 0, #000 ${MASK_WIDTH}, #000 calc(100% - ${MASK_WIDTH}), transparent)`,
    `linear-gradient(to bottom, transparent 0, #000 ${MASK_HEIGHT}, #000 calc(100% - ${MASK_HEIGHT}), transparent 100%)`,
    `radial-gradient(at bottom right, ${MASK_CORNER})`,
    `radial-gradient(at bottom left, ${MASK_CORNER})`,
    `radial-gradient(at top left, ${MASK_CORNER})`,
    `radial-gradient(at top right, ${MASK_CORNER})`,
  ].join(", "),
  WebkitMaskPosition:
    "center, center, top left, top right, bottom right, bottom left",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskSize: [
    `100% calc(100% - ${MASK_HEIGHT} * 2)`,
    `calc(100% - ${MASK_WIDTH} * 2) 100%`,
    `${MASK_WIDTH} ${MASK_HEIGHT}`,
    `${MASK_WIDTH} ${MASK_HEIGHT}`,
    `${MASK_WIDTH} ${MASK_HEIGHT}`,
    `${MASK_WIDTH} ${MASK_HEIGHT}`,
  ].join(", "),
  marginInline: `calc(-1 * ${MASK_WIDTH})`,
};

// Compensates the outer element's negative margin, reserving blank space for
// the mask's fade zone so it doesn't cut into actual digit ink.
const numberMaskInnerStyle: CSSProperties = {
  padding: `calc(${MASK_HEIGHT} / 2) ${MASK_WIDTH}`,
};

const DIGIT_FACES = Array.from({ length: DIGIT_LENGTH }, (_, i) => i);

// --- Digit --------------------------------------------------------------

interface DigitFaceProps {
  mv: MotionValue<number>;
  n: number;
  willChange: boolean;
}

function DigitFace({ n, mv, willChange }: DigitFaceProps) {
  const y = useTransform(mv, (c) => `${digitFaceOffset(n, c) * 100}%`);
  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        willChange && "will-change-transform"
      )}
      style={{ y }}
    >
      {n}
    </motion.span>
  );
}

interface DigitProps {
  animateIn: boolean;
  layoutTransition: Transition;
  /** Digit place (see `KeyedDigitPart.pos`); used for the continuous-loop effect. */
  pos: number;
  reduced: boolean;
  ref?: Ref<HTMLSpanElement>;
  /** Least-significant place at/before which unchanged digits still loop once. */
  startingPos: number | undefined;
  transition: Transition;
  trend: number;
  value: number;
  willChange: boolean;
}

// `mode="popLayout"` needs to grab this component's underlying DOM node to pop
// it out of flow while it exits (see AnimatePresence usage below) — without
// forwarding `ref`, the exiting digit stays in flow for its whole fade, and
// siblings only slide into the gap it leaves behind once it finally unmounts.
function Digit({
  value,
  trend,
  transition,
  layoutTransition,
  animateIn,
  reduced,
  pos,
  startingPos,
  willChange,
  ref,
}: DigitProps) {
  const mv = useMotionValue(reduced || !animateIn ? value : 0);
  const isMountRef = useRef(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: startingPos must also retrigger the roll, for digits whose own value didn't change (continuous-loop effect)
  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false;
      if (!reduced && animateIn) {
        const delta = getDigitDelta(0, value, trend);
        const controls = animate(mv, delta, transition);
        return () => controls.stop();
      }
      return;
    }

    if (reduced) {
      mv.set(value);
      return;
    }

    // Rebase off the motion value's current position (possibly mid-flight) so
    // rapid updates still converge to the correct face.
    const current = mv.get();
    let delta = getDigitDelta(mod(current, DIGIT_LENGTH), value, trend);
    if (delta === 0) {
      // This digit's own face didn't change, but a less-significant digit did
      // — loop it through a full rotation so the whole number reads as
      // passing continuously through the intermediate values.
      if (trend && startingPos != null && startingPos >= pos) {
        delta = DIGIT_LENGTH * trend;
      } else {
        return;
      }
    }
    const controls = animate(mv, current + delta, transition);
    return () => controls.stop();
  }, [value, startingPos]);

  return (
    <motion.span
      animate={{ opacity: 1 }}
      // No `overflow-hidden` here on purpose: the row-level mask (see
      // numberMaskStyle) is what hides/fades the sliding faces. A hard clip
      // here would cut them off before the mask ever gets to soften them, and
      // (per the original) `overflow:clip` also breaks baseline alignment in
      // Safari.
      className={cn(
        "relative inline-block align-bottom tabular-nums",
        willChange && "will-change-transform"
      )}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      layout
      ref={ref}
      transition={layoutTransition}
    >
      <span aria-hidden="true" className="invisible">
        0
      </span>
      {DIGIT_FACES.map((n) => (
        <DigitFace key={n} mv={mv} n={n} willChange={willChange} />
      ))}
    </motion.span>
  );
}

// --- NumberFlow -----------------------------------------------------------

const DEFAULT_TRANSITION: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
};

const DEFAULT_OPACITY_TRANSITION: Transition = {
  duration: 0.45,
  ease: "easeOut",
};

const REDUCED_TRANSITION: Transition = { duration: 0 };

export interface NumberFlowProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Passed to `Intl.NumberFormat`. */
  format?: Intl.NumberFormatOptions;
  /** Passed to `Intl.NumberFormat`. */
  locales?: Intl.LocalesArgument;
  /** Rendered before the formatted value, e.g. a currency symbol override. */
  prefix?: string;
  /** Skip animation when the user has requested reduced motion (default true). */
  respectMotionPreference?: boolean;
  /** Overrides `transition` for the digit roll specifically. */
  spinTransition?: Transition;
  /** Rendered after the formatted value, e.g. a unit. */
  suffix?: string;
  /** Transition for the digit roll and layout reflow. */
  transition?: Transition;
  /**
   * Controls which direction digits spin. A number's sign is used directly;
   * a function receives `(prevValue, value)` and should return one. Defaults
   * to `Math.sign(value - prevValue)`.
   */
  trend?: NumberFlowTrend;
  /** The number to display. Changing this triggers the roll animation. */
  value: number;
  /**
   * Hints the browser to promote digits/symbols onto their own composite
   * layer ahead of time. Costs GPU memory, so only turn it on for instances
   * that animate often (e.g. a live-updating counter), not static ones.
   * @default false
   */
  willChange?: boolean;
}

function usePrevious<T>(value: T) {
  const ref = useRef(value);
  const prev = ref.current;
  ref.current = value;
  return prev;
}

function useIsFirstRender() {
  const ref = useRef(true);
  const isFirst = ref.current;
  ref.current = false;
  return isFirst;
}

/** Skip animating when detached, hidden, or the document tab is backgrounded. */
function canAnimateElement(el: HTMLElement | null) {
  if (
    typeof document !== "undefined" &&
    document.visibilityState !== "visible"
  ) {
    return false;
  }
  return Boolean(el && el.offsetWidth > 0 && el.offsetHeight > 0);
}

export function NumberFlow({
  value,
  locales,
  format,
  prefix,
  suffix,
  trend = (prevValue, next) => Math.sign(next - prevValue),
  transition = DEFAULT_TRANSITION,
  spinTransition,
  respectMotionPreference = true,
  willChange = false,
  className,
  style,
  ...props
}: NumberFlowProps) {
  const prefersReducedMotion = useReducedMotion();
  const isFirstRender = useIsFirstRender();
  const rootRef = useRef<HTMLSpanElement>(null);
  // Re-checked every render so off-screen or backgrounded instances skip
  // animation on the next value update.
  const reduced =
    Boolean(respectMotionPreference && prefersReducedMotion) ||
    !(isFirstRender || canAnimateElement(rootRef.current));

  const localesKey = JSON.stringify(locales ?? null);
  const formatKey = JSON.stringify(format ?? null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed by the serialized locales/format, not their (possibly-new-every-render) identity
  const formatter = useMemo(
    () => new Intl.NumberFormat(locales, format),
    [localesKey, formatKey]
  );

  const data = useMemo(
    () => formatToParts(value, formatter, prefix, suffix),
    [value, formatter, prefix, suffix]
  );

  const prevData = usePrevious(data);
  const computedTrend = resolveTrend(trend, prevData.value, data.value);

  const startingPos = useMemo(
    () =>
      computeStartingPos(
        prevData.parts.filter(isDigitPart),
        data.parts.filter(isDigitPart),
        computedTrend
      ),
    [prevData, data, computedTrend]
  );

  const spinT = reduced ? REDUCED_TRANSITION : (spinTransition ?? transition);
  const layoutT = reduced ? REDUCED_TRANSITION : transition;
  const opacityT = reduced ? REDUCED_TRANSITION : DEFAULT_OPACITY_TRANSITION;

  return (
    <span
      aria-label={data.valueAsString}
      className={cn("inline-block tabular-nums", className)}
      dir="ltr"
      ref={rootRef}
      role="img"
      style={{ ...numberMaskStyle, ...style }}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "isolate inline-flex",
          willChange && "will-change-transform"
        )}
        style={numberMaskInnerStyle}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {data.parts.map((part) =>
            isDigitPart(part) ? (
              <Digit
                animateIn={!isFirstRender}
                key={part.key}
                layoutTransition={layoutT}
                pos={part.pos}
                reduced={reduced}
                startingPos={startingPos}
                transition={spinT}
                trend={computedTrend}
                value={part.value}
                willChange={willChange}
              />
            ) : (
              <motion.span
                animate={{ opacity: 1 }}
                // plus-lighter (not source-over) so an exiting and entering
                // symbol at the same spot add together instead of
                // double-darkening while both are partially opaque mid-fade
                // (e.g. a sign flipping from "+" to "-").
                className={cn(
                  "inline-block mix-blend-plus-lighter",
                  willChange && "will-change-transform"
                )}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={part.key}
                layout
                transition={opacityT}
              >
                {part.value}
              </motion.span>
            )
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}
