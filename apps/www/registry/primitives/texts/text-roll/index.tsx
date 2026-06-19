"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import {
  type HTMLAttributes,
  type Ref,
  type RefCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  animateTextRoll,
  buildTextRoll,
  chromatic as chromaticSweep,
  clearTextRoll,
  type TextRollOptions,
} from "./text-roll-core";

export type { ChromaticOptions, TextRollOptions } from "./text-roll-core";
// biome-ignore lint/performance/noBarrelFile: Registry entry re-exports imperative helpers alongside the React component.
export {
  animateTextRoll,
  buildTextRoll,
  chromatic,
  clearTextRoll,
} from "./text-roll-core";

export interface TextRollProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Shorthand for `options.bounce`. */
  bounce?: number;
  /**
   * When true, applies a chromatic color sweep via `chromatic()`.
   * Use `options.color` for full control.
   */
  chromatic?: boolean;
  /**
   * Shorthand for `options.direction` — exposed for docs Tweakpane controls.
   */
  direction?: TextRollOptions["direction"];
  /** Shorthand for `options.duration`. */
  duration?: number;
  /** Roll animation options. */
  options?: TextRollOptions;
  ref?: Ref<HTMLSpanElement>;
  /** Shorthand for `options.skipUnchanged`. */
  skipUnchanged?: boolean;
  /** Shorthand for `options.stagger`. */
  stagger?: number;
  /** Text to display. Changing this value triggers the roll animation. */
  text: string;
}

export interface TextRollPlaygroundProps {
  bounce?: number;
  chromatic?: boolean;
  className?: string;
  duration?: number;
  stagger?: number;
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

function resolveOptions({
  options,
  direction,
  stagger,
  duration,
  bounce,
  skipUnchanged,
  chromatic: useChromatic,
}: Pick<
  TextRollProps,
  | "options"
  | "direction"
  | "stagger"
  | "duration"
  | "bounce"
  | "skipUnchanged"
  | "chromatic"
>): TextRollOptions {
  return {
    ...options,
    ...(direction === undefined ? {} : { direction }),
    ...(stagger === undefined ? {} : { stagger }),
    ...(duration === undefined ? {} : { duration }),
    ...(bounce === undefined ? {} : { bounce }),
    ...(skipUnchanged === undefined ? {} : { skipUnchanged }),
    ...(useChromatic ? { color: chromaticSweep() } : {}),
  };
}

/** Matches `slot-text/react` — roll animates when `text` changes. */
export function TextRoll({
  text,
  options,
  direction,
  stagger,
  duration,
  bounce,
  skipUnchanged,
  chromatic: useChromatic,
  className,
  ref,
  ...props
}: TextRollProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const mountedRef = useRef(false);
  const firstTextEffectRef = useRef(true);
  const optionsRef = useRef<TextRollOptions | undefined>(
    resolveOptions({
      options,
      direction,
      stagger,
      duration,
      bounce,
      skipUnchanged,
      chromatic: useChromatic,
    })
  );
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    optionsRef.current = resolveOptions({
      options,
      direction,
      stagger,
      duration,
      bounce,
      skipUnchanged,
      chromatic: useChromatic,
    });
  }, [
    options,
    direction,
    stagger,
    duration,
    bounce,
    skipUnchanged,
    useChromatic,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only DOM setup (slot-text/react)
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    buildTextRoll(element, text);
    mountedRef.current = true;

    return () => {
      clearTextRoll(element);
      mountedRef.current = false;
      firstTextEffectRef.current = true;
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!(element && mountedRef.current)) {
      return;
    }
    if (firstTextEffectRef.current) {
      firstTextEffectRef.current = false;
      return;
    }

    if (prefersReducedMotion) {
      buildTextRoll(element, text);
      return;
    }

    animateTextRoll(element, text, optionsRef.current);
  }, [text, prefersReducedMotion]);

  return (
    <span
      className={cn("inline-flex whitespace-pre", className)}
      ref={mergeRefs(elementRef, ref)}
      {...props}
    />
  );
}

/** Docs preview — click toggles Copy / Copied like slot-text examples. */
export function TextRollPlayground({
  bounce = 0.6,
  chromatic: chromaticOnCopy = true,
  className = "font-medium text-lg tabular-nums",
  duration = 300,
  stagger = 45,
}: TextRollPlaygroundProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent"
      onClick={() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      type="button"
    >
      <TextRoll
        className={className}
        options={{
          bounce,
          direction: copied ? "up" : "down",
          duration,
          skipUnchanged: false,
          stagger,
          color:
            copied && chromaticOnCopy
              ? chromaticSweep({ from: 190 })
              : undefined,
        }}
        text={copied ? "Copied" : "Copy"}
      />
    </button>
  );
}
