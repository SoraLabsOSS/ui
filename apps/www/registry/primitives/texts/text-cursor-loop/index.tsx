/** biome-ignore-all lint/suspicious/noArrayIndexKey: characters are positional per rendered word, never reordered. */
"use client";

import { cn } from "@workspace/ui/lib/utils";
import { animate, useReducedMotion } from "motion/react";
import {
  type ElementType,
  type ReactNode,
  type Ref,
  type RefCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

const COLLAPSE_CHAR_DURATION = 0.1;
const REVEAL_CHAR_DURATION = 0.15;
/** ms — matches anime.js's `stagger(25, { ..., start: 100 })` on the reveal phase. */
const REVEAL_START_DELAY_MS = 100;
/** seconds — matches anime.js's `delay: 50` on the collapse-phase cursor tween. */
const CURSOR_COLLAPSE_DELAY = 0.05;
const CURSOR_COLLAPSE_SCALE_FROM = 4;
const CURSOR_REVEAL_SCALE_FROM = 8;

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function easePowerIn(power: number) {
  return (t: number) => t ** power;
}

function easePowerOut(power: number) {
  return (t: number) => 1 - (1 - t) ** power;
}

// Matches anime.js's `stagger(..., { ease: "in(3)" })` on the char delay curve.
const EASE_STAGGER_IN_3 = easePowerIn(3);
// Matches anime.js's implicit default ease ("outQuad") on the char opacity/scaleX tween.
const EASE_CHAR_DEFAULT = easePowerOut(2);
// Matches anime.js's explicit `ease: "out(3)"` on the cursor tween.
const EASE_CURSOR_OUT_3 = easePowerOut(3);

/**
 * Reproduces anime.js's `stagger(spacingMs, { from, ease: "in(3)", start })`
 * delay formula exactly (`scripts.js:31757`): each index's linear distance
 * from `fromIndex` is normalized, warped through the power-in(3) curve, then
 * scaled back up and multiplied by the per-step spacing.
 */
function staggerDelayMs(
  index: number,
  total: number,
  fromIndex: number,
  spacingMs: number,
  startMs: number
) {
  if (total <= 1) {
    return startMs;
  }
  const maxValue = total - 1;
  const distance = Math.abs(fromIndex - index);
  const eased = EASE_STAGGER_IN_3(distance / maxValue) * maxValue;
  return startMs + spacingMs * round2(eased);
}

export type TextCursorLoopPhase = "collapsing" | "idle" | "revealing";

export interface TextCursorLoopClassNames {
  /** The trailing cursor glyph. */
  cursor?: string;
}

export interface TextCursorLoopProps {
  /** Root tag. @default "span" */
  as?: ElementType;
  /**
   * Milliseconds between each character's stagger start.
   * @default 25
   */
  charDelay?: number;
  className?: string;
  /** Per-slot class overrides: `cursor`. */
  classNames?: TextCursorLoopClassNames;
  /** The trailing glyph that wipes across the text between words. @default "." */
  cursor?: ReactNode;
  /**
   * Milliseconds a word stays fully visible before collapsing.
   * @default 1750
   */
  holdDuration?: number;
  /** Wrap back to the first word after the last one. @default true */
  loop?: boolean;
  onIndexChange?: (index: number) => void;
  ref?: Ref<HTMLElement>;
  /** Set false to pause cycling. @default true */
  trigger?: boolean;
  /** Words cycled in order. */
  words: string[];
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getNextIndex(current: number, length: number, loop: boolean) {
  const next = current + 1;
  if (next < length) {
    return next;
  }
  return loop ? 0 : null;
}

interface CycleRefs {
  cancelledRef: { current: boolean };
  charRefs: { current: (HTMLSpanElement | null)[] };
  charsWrapRef: { current: HTMLSpanElement | null };
  cursorRef: { current: HTMLSpanElement | null };
  indexRef: { current: number };
}

interface CycleOptions {
  charDelay: number;
  holdDuration: number;
  loop: boolean;
  onIndexChange?: (index: number) => void;
  setDisplayWord: (word: string) => void;
  setPhase: (phase: TextCursorLoopPhase) => void;
  words: string[];
}

function filterChars(refs: (HTMLSpanElement | null)[]): HTMLSpanElement[] {
  return refs.filter((el): el is HTMLSpanElement => el !== null);
}

/** Runs one hold→collapse→swap→reveal cycle. Returns "stop" once cancelled or the sequence ends (non-looping). */
async function runCycleStep(
  refs: CycleRefs,
  options: CycleOptions
): Promise<"continue" | "stop"> {
  await sleep(options.holdDuration);
  if (refs.cancelledRef.current) {
    return "stop";
  }

  const wrap = refs.charsWrapRef.current;
  const cursorEl = refs.cursorRef.current;
  const oldChars = filterChars(refs.charRefs.current);
  if (!(wrap && cursorEl) || oldChars.length === 0) {
    return "stop";
  }

  options.setPhase("collapsing");
  await collapseWord(oldChars, cursorEl, wrap, options.charDelay);
  if (refs.cancelledRef.current) {
    return "stop";
  }
  // `wrap`'s layout box is still sized for the outgoing word here — the
  // collapse animation only scaled chars visually, transforms don't
  // affect layout — so this is the correct "from" width for revealWord's
  // width tween below.
  const oldWordWidth = wrap.getBoundingClientRect().width;

  const nextIndex = getNextIndex(
    refs.indexRef.current,
    options.words.length,
    options.loop
  );
  if (nextIndex === null) {
    return "stop";
  }
  refs.indexRef.current = nextIndex;
  options.onIndexChange?.(nextIndex);

  refs.charRefs.current = [];
  flushSync(() => {
    options.setDisplayWord(options.words[nextIndex] ?? "");
  });
  if (refs.cancelledRef.current) {
    return "stop";
  }

  const newChars = filterChars(refs.charRefs.current);
  if (newChars.length === 0) {
    options.setPhase("idle");
    return "continue";
  }

  options.setPhase("revealing");
  await revealWord(newChars, cursorEl, wrap, options.charDelay, oldWordWidth);
  if (refs.cancelledRef.current) {
    return "stop";
  }
  options.setPhase("idle");
  return "continue";
}

async function collapseWord(
  chars: HTMLSpanElement[],
  cursorEl: HTMLSpanElement,
  wrap: HTMLSpanElement,
  charDelay: number
) {
  const width = wrap.getBoundingClientRect().width;
  cursorEl.style.transformOrigin = "100% 0%";
  const total = chars.length;
  const lastIndex = total - 1;

  await Promise.all([
    ...chars.map((el, i) =>
      animate(
        el,
        { opacity: 0, scaleX: 0 },
        {
          delay: staggerDelayMs(i, total, lastIndex, charDelay, 0) / 1000,
          duration: COLLAPSE_CHAR_DURATION,
          ease: EASE_CHAR_DEFAULT,
        }
      )
    ),
    animate(
      cursorEl,
      { scaleX: [CURSOR_COLLAPSE_SCALE_FROM, 1], x: -width },
      {
        delay: CURSOR_COLLAPSE_DELAY,
        duration: (total * charDelay + 100) / 1000,
        ease: EASE_CURSOR_OUT_3,
      }
    ),
  ]);
}

async function revealWord(
  chars: HTMLSpanElement[],
  cursorEl: HTMLSpanElement,
  wrap: HTMLSpanElement,
  charDelay: number,
  fromWidth: number
) {
  for (const el of chars) {
    el.style.opacity = "0";
    el.style.transform = "scaleX(0) translateX(10px)";
  }
  // Transforms don't affect layout, so `wrap`'s box is still sized for the
  // *old* word at this point — `scrollWidth` reads the new (untransformed)
  // content's natural size regardless. Pinning `width` to the old size
  // before animating it to the new one is what makes the container resize
  // in step with the chars, instead of snapping the instant React commits
  // the new word.
  const toWidth = wrap.scrollWidth;
  wrap.style.width = `${fromWidth}px`;
  cursorEl.style.transformOrigin = "0% 0%";
  const total = chars.length;
  const cursorDuration = (total * charDelay + 75) / 1000;

  await Promise.all([
    ...chars.map((el, i) =>
      animate(
        el,
        { opacity: 1, scaleX: 1, x: 0 },
        {
          delay:
            staggerDelayMs(i, total, 0, charDelay, REVEAL_START_DELAY_MS) /
            1000,
          duration: REVEAL_CHAR_DURATION,
          ease: EASE_CHAR_DEFAULT,
        }
      )
    ),
    animate(
      cursorEl,
      { scaleX: [CURSOR_REVEAL_SCALE_FROM, 1], x: [-fromWidth, 0] },
      { duration: cursorDuration, ease: EASE_CURSOR_OUT_3 }
    ),
    animate(
      wrap,
      { width: toWidth },
      { duration: cursorDuration, ease: EASE_CURSOR_OUT_3 }
    ),
  ]);

  wrap.style.width = "";
}

export function TextCursorLoop({
  as,
  charDelay = 25,
  className,
  classNames,
  cursor = ".",
  holdDuration = 1750,
  loop = true,
  onIndexChange,
  ref,
  trigger = true,
  words,
}: TextCursorLoopProps) {
  const Component = as ?? "span";
  const prefersReducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const charsWrapRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const cancelledRef = useRef(false);
  const indexRef = useRef(0);

  const [displayWord, setDisplayWord] = useState(words[0] ?? "");
  const [phase, setPhase] = useState<TextCursorLoopPhase>("idle");

  useEffect(() => {
    if (prefersReducedMotion || !trigger || words.length < 2) {
      return;
    }

    cancelledRef.current = false;
    indexRef.current = 0;
    setDisplayWord(words[0] ?? "");
    setPhase("idle");

    const cycleRefs: CycleRefs = {
      cancelledRef,
      charRefs,
      charsWrapRef,
      cursorRef,
      indexRef,
    };
    const cycleOptions: CycleOptions = {
      charDelay,
      holdDuration,
      loop,
      onIndexChange,
      setDisplayWord,
      setPhase,
      words,
    };

    const runCycle = async () => {
      let step: "continue" | "stop" = "continue";
      while (step === "continue" && !cancelledRef.current) {
        step = await runCycleStep(cycleRefs, cycleOptions);
      }
    };

    runCycle();

    return () => {
      cancelledRef.current = true;
    };
  }, [
    charDelay,
    holdDuration,
    loop,
    onIndexChange,
    prefersReducedMotion,
    trigger,
    words,
  ]);

  if (prefersReducedMotion) {
    return (
      <Component
        aria-label={words[0]}
        className={cn("relative inline-flex", className)}
        ref={mergeRefs(rootRef, ref)}
      >
        {words[0]}
      </Component>
    );
  }

  return (
    <Component
      aria-label={displayWord}
      className={cn("relative inline-flex", className)}
      data-phase={phase}
      ref={mergeRefs(rootRef, ref)}
    >
      <span aria-hidden="true" className="inline-flex" ref={charsWrapRef}>
        {[...displayWord].map((char, index) => (
          <span
            className="inline-block"
            key={index}
            ref={(el) => {
              charRefs.current[index] = el;
            }}
            style={char === " " ? { whiteSpace: "pre" } : undefined}
          >
            {char}
          </span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "inline-block transition-colors duration-200",
          classNames?.cursor
        )}
        data-phase={phase}
        ref={cursorRef}
      >
        {cursor}
      </span>
    </Component>
  );
}
