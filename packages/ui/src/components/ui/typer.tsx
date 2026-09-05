"use client";

import { cn } from "@workspace/ui/lib/utils";
import type React from "react";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

export type TyperType = "initial" | "in" | "out" | "inout" | "done";

export type TyperVariation =
  | "charFill"
  | "charInverse"
  | "charAccent"
  | "charAccentInverse"
  | "charAccentFill"
  | "charBorder";

export interface TyperRef {
  getType: () => TyperType;
  reset: (newText: string) => void;
  triggerIn: () => void;
  triggerInOut: () => void;
  triggerOut: () => void;
}

export interface TyperProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  children?: string;
  className?: string;
  cycleLength?: number;
  cycles?: number;
  delay?: number;
  fps?: number;
  initVisible?: boolean;
  onComplete?: () => void;
  ref?: React.Ref<TyperRef | null>;
  text?: string;
  trigger?: "in" | "out" | "inout";
  triggerOnHover?: boolean;
  triggerOnMount?: boolean;
  type?: TyperType;
  variations?: TyperVariation[];
}

interface CharNode {
  char: string;
  cp: number;
  id: string;
}

interface ParsedWord {
  chars: CharNode[];
  id: string;
  isSpace: boolean;
  text: string;
}

// ============================================================================
// Constants & Regular Expressions
// ============================================================================

const WORD_SPLIT_REGEX = /(\s+)/;
const WHITESPACE_REGEX = /\s/g;
const SPACE_REPLACE_REGEX = / /g;

const DEFAULT_VARIATIONS: TyperVariation[] = [
  "charFill",
  "charInverse",
  "charAccent",
  "charAccentInverse",
  "charAccentFill",
  "charBorder",
];

// ============================================================================
// Interpolation & Bezier Solver Utilities
// ============================================================================

const roundTo = (val: number, step: number): number =>
  Math.round(val / step) * step;

const clamp = (val: number, min: number, max: number): number => {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
};

const mapRange = (
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

function getBezierX(u: number, p1x: number, p2x: number): number {
  return (
    (1 - u) ** 3 * 0 +
    3 * (1 - u) ** 2 * u * p1x +
    3 * (1 - u) * u ** 2 * p2x +
    u ** 3 * 1
  );
}

function getBezierY(u: number, p1y: number, p2y: number): number {
  return (
    (1 - u) ** 3 * 0 +
    3 * (1 - u) ** 2 * u * p1y +
    3 * (1 - u) * u ** 2 * p2y +
    u ** 3 * 1
  );
}

function getBezierSlope(u: number, p1x: number, p2x: number): number {
  return (
    3 * (1 - u) ** 2 * p1x +
    6 * (1 - u) * u * (p2x - p1x) +
    3 * u ** 2 * (1 - p2x)
  );
}

function solveBezierT(
  targetX: number,
  p1x: number,
  p2x: number,
  precision = 1e-6
): number {
  let t = targetX;
  for (let i = 0; i < 8; i++) {
    const currentX = getBezierX(t, p1x, p2x) - targetX;
    if (Math.abs(currentX) < precision) {
      return t;
    }
    const slope = getBezierSlope(t, p1x, p2x);
    if (Math.abs(slope) < 1e-6) {
      break;
    }
    t -= currentX / slope;
  }

  let low = 0;
  let high = 1;
  let mid = targetX;
  while (low < high) {
    const currentX = getBezierX(mid, p1x, p2x);
    if (Math.abs(currentX - targetX) < precision) {
      return mid;
    }
    if (targetX > currentX) {
      low = mid;
    } else {
      high = mid;
    }
    mid = (high + low) / 2;
  }
  return mid;
}

/**
 * Computes the normalized progression curve for staggered character offsets.
 */
function bezierSolve(
  progress: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number
): number {
  const solvedT = solveBezierT(progress, p1x, p2x);
  return getBezierY(solvedT, p1y, p2y);
}

// ============================================================================
// Scoped Styles for Character Segments & Grouping
// ============================================================================

const TYPER_STYLES = `
[data-typer] {
  display: inline-flex;
  flex-wrap: wrap;
}
[data-typer][data-typer-type="initial"] {
  opacity: 0;
}
[data-typer] .word {
  white-space: pre;
  display: inline-block;
}
[data-typer] .space {
  white-space: pre;
  display: inline-block;
  flex-shrink: 0;
  width: var(--typer-space-width, 0.5em);
}
[data-typer] .word .char {
  box-sizing: content-box;
  display: inline-block;
  color: var(--foreground, currentColor);
  background: transparent;
}
[data-typer] .word .char.charInit {
  color: transparent !important;
}
[data-typer] .word .char.charFill {
  color: var(--background, #000);
  background: var(--foreground, currentColor);
  border-radius: 5px;
}
[data-typer] .word .char.charFill:has(+ .charFill) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charFill + .charFill {
  border-radius: 0;
}
[data-typer] .word .char.charFill + .charFill:last-child,
[data-typer] .word .char.charFill + .charFill:has(+ :not(.charFill)) {
  border-radius: 0 5px 5px 0;
}
[data-typer] .word .char.charInverse {
  color: var(--background, #000);
  background: var(--foreground, currentColor);
}
[data-typer] .word .char.charAccent {
  color: var(--foreground, currentColor);
  background: var(--accent, #0044ff);
}
[data-typer] .word .char.charAccentInverse {
  color: var(--background, #000);
  background: var(--accent, #0044ff);
}
[data-typer] .word .char.charAccentFill {
  color: var(--accent, #0044ff);
  background: var(--accent, #0044ff);
}
[data-typer] .word .char.charBorder {
  position: relative;
  color: var(--foreground, currentColor);
}
[data-typer] .word .char.charBorder::after {
  content: "";
  display: inline-block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid var(--foreground, currentColor);
  border-radius: 5px;
  box-sizing: border-box;
}
[data-typer] .word .char.charBorder:has(+ .charBorder)::after {
  border-right: 1px solid transparent;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[data-typer] .word .char.charBorder + .charBorder::after {
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  border-radius: 0;
}
[data-typer] .word .char.charBorder + .charBorder:last-child::after,
[data-typer] .word .char.charBorder + .charBorder:has(+ :not(.charBorder))::after {
  border-left: 1px solid transparent;
  border-right: 1px solid var(--foreground, currentColor);
  border-radius: 0 5px 5px 0;
}
`;

function resolveSubType(
  currentType: TyperType,
  frame: number,
  frames: number
): "in" | "out" | TyperType {
  if (currentType === "inout") {
    if (frame > frames) {
      return "out";
    }
    return "in";
  }
  return currentType;
}

function computeCharClassName(
  currentType: TyperType,
  frame: number,
  frames: number,
  denominator: number,
  cp: number,
  cycles: number,
  variations: TyperVariation[]
): string {
  if (currentType === "initial") {
    return "char charInit";
  }
  if (currentType === "done") {
    return "char";
  }

  const subType = resolveSubType(currentType, frame, frames);
  const offsetFrame =
    currentType === "inout" && subType === "out" ? frame - frames : frame;
  const normalizedProgress = offsetFrame / denominator;

  let progressDiff = normalizedProgress - cp;
  progressDiff = roundTo(progressDiff, 0.1);
  progressDiff = clamp(progressDiff, 0, 1);

  let variationClass = "charInit";
  if (progressDiff > 0) {
    const cycleStep = Math.round(mapRange(progressDiff, 0, 1, 0, cycles));
    const chosen = variations[cycleStep % variations.length];
    if (chosen) {
      variationClass = chosen;
    }
  }
  if (progressDiff >= 1) {
    variationClass = "";
  }

  const baseClass = variationClass ? `char ${variationClass}` : "char";

  if (subType === "in") {
    if (progressDiff <= 0) {
      return "char charInit";
    }
    if (progressDiff >= 1) {
      return "char";
    }
    return baseClass;
  }

  if (progressDiff <= 0) {
    return "char";
  }
  if (progressDiff >= 1) {
    return "char charInit";
  }
  return baseClass;
}

// ============================================================================
// Component Definition
// ============================================================================

export function Typer({
  as: Component = "span",
  children,
  className,
  cycleLength = 0.5,
  cycles = 3,
  delay = 0,
  fps = 20,
  initVisible = false,
  onComplete,
  ref,
  text: textProp,
  trigger,
  triggerOnHover = false,
  triggerOnMount = true,
  type: initialType = "initial",
  variations: variationsProp,
  ...props
}: TyperProps) {
  const [sourceText, setSourceText] = useState<string>(() => {
    if (textProp !== undefined) {
      return textProp;
    }
    if (typeof children === "string") {
      return children;
    }
    return "";
  });

  const [currentType, setCurrentType] = useState<TyperType>(() => {
    if (initVisible) {
      return "done";
    }
    return initialType;
  });
  const [frame, setFrame] = useState<number>(0);

  const elementRef = useRef<HTMLElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const currentTypeRef = useRef<TyperType>(currentType);
  currentTypeRef.current = currentType;

  const [activeVariations, setActiveVariations] = useState<TyperVariation[]>(
    () => {
      const list =
        variationsProp && variationsProp.length > 0
          ? variationsProp
          : DEFAULT_VARIATIONS;
      return [...list].sort(() => 0.5 - Math.random());
    }
  );

  const shuffleVariations = useCallback(() => {
    const list =
      variationsProp && variationsProp.length > 0
        ? variationsProp
        : DEFAULT_VARIATIONS;
    setActiveVariations([...list].sort(() => 0.5 - Math.random()));
  }, [variationsProp]);

  useEffect(() => {
    if (textProp !== undefined) {
      setSourceText(textProp);
    } else if (typeof children === "string") {
      setSourceText(children);
    } else {
      setSourceText("");
    }
  }, [textProp, children]);

  const { words, charList, frames, denominator } = useMemo(() => {
    const rawWords = sourceText.split(WORD_SPLIT_REGEX);
    const chars: CharNode[] = [];
    const cleanLength = sourceText.replace(WHITESPACE_REGEX, "").length;
    const divisor = cleanLength > 1 ? cleanLength - 1 : 1;
    const calculatedFrames = cleanLength ? fps * (1 + cleanLength * 0.01) : 0;
    const calculatedDenominator =
      calculatedFrames - calculatedFrames * cycleLength || 1;

    let charIdx = 0;
    let wordCounter = 0;

    const parsedWords: ParsedWord[] = rawWords.map((word) => {
      wordCounter += 1;
      const wordId = `w-${wordCounter}-${word}`;
      const isSpace = word.trim() === "";
      if (isSpace) {
        return { chars: [], id: wordId, isSpace: true, text: word };
      }

      const wordChars = word.split("").map((ch) => {
        const a = charIdx / divisor;
        const cp = roundTo(bezierSolve(a, 0, 0.75, 0.75, 0), 0.05);
        charIdx += 1;
        const node: CharNode = { char: ch, cp, id: `c-${charIdx}-${ch}` };
        chars.push(node);
        return node;
      });

      return { chars: wordChars, id: wordId, isSpace: false, text: word };
    });

    return {
      charList: chars,
      denominator: calculatedDenominator,
      frames: calculatedFrames,
      words: parsedWords,
    };
  }, [sourceText, fps, cycleLength]);

  const stopLoop = useCallback(() => {
    if (delayTimerRef.current !== null) {
      window.clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (loopRef.current !== null) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  const setType = useCallback(
    (newType: TyperType) => {
      if (newType === currentTypeRef.current && newType !== "inout") {
        return;
      }

      stopLoop();
      setCurrentType(newType);
      setFrame(0);

      if (newType === "initial" || charList.length === 0) {
        return;
      }

      shuffleVariations();

      const runLoop = () => {
        delayTimerRef.current = null;
        let currentFrame = 0;
        const completionFrames = Math.ceil(1.9 * denominator);
        const singlePhaseFrames = Math.max(frames, completionFrames);
        const totalTargetFrames =
          newType === "inout" ? singlePhaseFrames * 2 : singlePhaseFrames;

        loopRef.current = window.setInterval(() => {
          currentFrame += 1;
          const clamped = clamp(currentFrame, 0, totalTargetFrames);
          setFrame(clamped);

          if (clamped >= totalTargetFrames) {
            stopLoop();
            setCurrentType(
              newType === "out" || newType === "inout" ? "initial" : "done"
            );
            onComplete?.();
          }
        }, 1000 / fps);
      };

      if (delay > 0) {
        delayTimerRef.current = window.setTimeout(runLoop, delay * 1000);
      } else {
        runLoop();
      }
    },
    [
      charList.length,
      delay,
      denominator,
      fps,
      frames,
      onComplete,
      shuffleVariations,
      stopLoop,
    ]
  );

  const reset = useCallback(
    (newText: string) => {
      stopLoop();
      setSourceText(newText);
      setFrame(0);
      setCurrentType("initial");
    },
    [stopLoop]
  );

  useImperativeHandle(
    ref,
    () => ({
      getType: () => currentTypeRef.current,
      reset: (newText: string) => {
        reset(newText);
      },
      triggerIn: () => {
        setType("in");
      },
      triggerInOut: () => {
        setType("inout");
      },
      triggerOut: () => {
        setType("out");
      },
    }),
    [reset, setType]
  );

  useEffect(() => {
    const el = elementRef.current;
    if (!el) {
      return;
    }

    const onIn = () => {
      setType("in");
    };
    const onOut = () => {
      setType("out");
    };
    const onInOut = () => {
      setType("inout");
    };
    const onReset = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        reset(customEvent.detail);
      }
    };

    el.addEventListener("typer:in", onIn);
    el.addEventListener("typer:out", onOut);
    el.addEventListener("typer:inout", onInOut);
    el.addEventListener("typer:reset", onReset);

    return () => {
      el.removeEventListener("typer:in", onIn);
      el.removeEventListener("typer:out", onOut);
      el.removeEventListener("typer:inout", onInOut);
      el.removeEventListener("typer:reset", onReset);
    };
  }, [setType, reset]);

  useEffect(() => {
    if (trigger) {
      setType(trigger);
    } else if (triggerOnMount && !initVisible) {
      setType("in");
    }
  }, [trigger, triggerOnMount, initVisible, setType]);

  useEffect(
    () => () => {
      stopLoop();
    },
    [stopLoop]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      props.onMouseEnter?.(e);
      if (triggerOnHover) {
        setType("inout");
      }
    },
    [props.onMouseEnter, triggerOnHover, setType]
  );

  return (
    <>
      <style>{TYPER_STYLES}</style>
      <Component
        className={cn(className)}
        data-typer=""
        data-typer-type={currentType}
        onMouseEnter={handleMouseEnter}
        ref={elementRef}
        {...props}
      >
        {words.map((w) => {
          if (w.isSpace) {
            return (
              <span className="space" key={w.id}>
                {w.text.replace(SPACE_REPLACE_REGEX, "\u00A0")}
              </span>
            );
          }

          return (
            <span className="word" key={w.id}>
              {w.chars.map((ch) => (
                <span
                  className={computeCharClassName(
                    currentType,
                    frame,
                    frames,
                    denominator,
                    ch.cp,
                    cycles,
                    activeVariations
                  )}
                  key={ch.id}
                >
                  {ch.char === " " ? "\u00A0" : ch.char}
                </span>
              ))}
            </span>
          );
        })}
      </Component>
    </>
  );
}

export default Typer;
