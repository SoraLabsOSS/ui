"use client";

import { cn } from "@workspace/ui/lib/utils";
import React, {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  HTML_AMP_REGEX,
  HTML_APOS_REGEX,
  HTML_GT_REGEX,
  HTML_LT_REGEX,
  HTML_QUOT_REGEX,
  NEWLINE_GLOBAL_REGEX,
  type TextMorphOptions,
} from "./defs";
import { MorphController } from "./runtime";

// --- React Helpers & Hook ----------------------------------------------------

function childrenToValue(node: React.ReactNode): number | string {
  if (typeof node === "number") {
    return node;
  }
  return childrenToString(node);
}

function childrenToString(node: React.ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (!node || typeof node === "boolean") {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map(childrenToString).join("");
  }
  if (React.isValidElement(node)) {
    throw new Error(
      "TextMorph only accepts text content. Found a React element — use strings, numbers, or expressions instead."
    );
  }
  return String(node);
}

function escapeHTML(value: string): string {
  return value
    .replace(HTML_AMP_REGEX, "&amp;")
    .replace(HTML_LT_REGEX, "&lt;")
    .replace(HTML_GT_REGEX, "&gt;")
    .replace(HTML_QUOT_REGEX, "&quot;")
    .replace(HTML_APOS_REGEX, "&#39;");
}

export function useTextMorph(props: TextMorphOptions) {
  const ref = useRef<HTMLElement | null>(null);
  const controllerRef = useRef(new MorphController());

  const configKey = MorphController.serializeConfig(props);

  const handlers = useRef(props);
  handlers.current = props;

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-attach only when serialized configKey changes; props identity changes every render
  useEffect(() => {
    const controller = controllerRef.current;
    if (ref.current) {
      controller.attach(ref.current, {
        ...props,
        onAnimationCancel: () => {
          handlers.current.onAnimationCancel?.();
        },
        onAnimationComplete: () => {
          handlers.current.onAnimationComplete?.();
        },
        onAnimationStart: () => {
          handlers.current.onAnimationStart?.();
        },
      });
    }

    return () => {
      controller.destroy();
    };
  }, [configKey]);

  const update = useCallback((value: number | string, cursorIndex?: number) => {
    controllerRef.current.update(value, cursorIndex);
  }, []);

  return { ref, update };
}

// --- React Component ---------------------------------------------------------

export type TextMorphProps = TextMorphOptions & {
  /**
   * Semantic HTML element for the root container.
   * @default "span"
   */
  as?: ElementType;
  /**
   * The text or numeric content to morph between updates.
   */
  children: React.ReactNode;
  /**
   * CSS class name applied to the root container.
   */
  className?: string;
  /**
   * Caret position for a single-number value: place matching becomes caret matching.
   */
  cursorIndex?: number;
  /**
   * Live region politeness when the label updates.
   * @default "off"
   */
  live?: "assertive" | "off" | "polite";
  /**
   * Forwarded ref to the container element.
   */
  ref?: React.Ref<HTMLElement>;
  /**
   * Inline styles applied to the root container.
   */
  style?: CSSProperties;
} & Omit<ComponentPropsWithoutRef<"span">, "children" | "style">;

export function TextMorph({
  children,
  cursorIndex,
  className,
  style,
  as: Component = "span",
  charClassName,
  duration,
  ease,
  scale,
  numbers,
  decimals,
  locale,
  debug,
  disabled,
  respectReducedMotion,
  onAnimationStart,
  onAnimationComplete,
  onAnimationCancel,
  live = "off",
  ref,
  ...restProps
}: TextMorphProps) {
  const morphOptions: TextMorphOptions = {
    charClassName,
    debug,
    decimals,
    disabled,
    duration,
    ease,
    locale,
    numbers,
    onAnimationCancel,
    onAnimationComplete,
    onAnimationStart,
    respectReducedMotion,
    scale,
  };

  const { ref: internalRef, update } = useTextMorph(morphOptions);
  const value = childrenToValue(children);
  const cursorRef = useRef(cursorIndex);
  cursorRef.current = cursorIndex;

  const initialHTML = useRef({
    __html: escapeHTML(String(value)).replace(NEWLINE_GLOBAL_REGEX, "<br>"),
  });

  useEffect(() => {
    update(value, cursorRef.current);
  }, [value, update]);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && "current" in ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref, internalRef]
  );

  const elementProps = {
    "aria-live": live === "off" ? undefined : live,
    className: cn(className),
    dangerouslySetInnerHTML: initialHTML.current,
    ref: setRefs,
    style,
    ...restProps,
  };

  return <Component {...elementProps} />;
}

export default TextMorph;
