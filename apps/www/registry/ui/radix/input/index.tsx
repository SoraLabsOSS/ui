"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const inputClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const FIREFOX_REGEX = /firefox|fxios/i;
const CHROME_REGEX = /chrome|chromium|crios/i;
const ANIMATED_CARET_TYPES = new Set([
  "text",
  "search",
  "url",
  "tel",
  "password",
]);

export type InputProps = ComponentPropsWithRef<"input">;

function setRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function Input({
  className,
  ref,
  type = "text",
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  ...props
}: InputProps) {
  const [internalValue, setInternalValue] = useState(
    String(defaultValue ?? "")
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const caretMarkerRef = useRef<HTMLSpanElement>(null);
  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const caretInitializedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const isFileInput = type === "file";
  const hasAnimatedCaret = ANIMATED_CARET_TYPES.has(type);
  const isControlled = value !== undefined;
  let renderedValue: InputProps["value"];
  if (isControlled && !isFileInput) {
    renderedValue = value;
  }
  const inputValue = isControlled ? String(value) : internalValue;
  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion
      ? { stiffness: 10_000, damping: 100, mass: 0.1 }
      : { stiffness: 500, damping: 30, mass: 0.5 }
  );

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      setRef(ref, node);
    },
    [ref]
  );

  const updateCaretFromInput = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: caret mapping mirrors native selection and horizontal scroll edge cases.
    (target: HTMLInputElement) => {
      const measureSpan = measureRef.current;
      const caretMarker = caretMarkerRef.current;
      if (!(measureSpan && caretMarker) || target.selectionStart === null) {
        caretOpacity.set(0);
        return;
      }

      const styles = window.getComputedStyle(target);
      const isPassword = target.type === "password";
      const passwordChar = FIREFOX_REGEX.test(navigator.userAgent)
        ? "\u25cf"
        : "\u2022";
      let fontSize = styles.fontSize;

      if (
        passwordChar === "\u2022" &&
        isPassword &&
        !CHROME_REGEX.test(navigator.userAgent)
      ) {
        fontSize = `${Number.parseFloat(fontSize) + 6.25}px`;
      }

      measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize} ${styles.fontFamily}`;
      measureSpan.style.letterSpacing = styles.letterSpacing;
      measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
      measureSpan.style.fontVariationSettings = styles.fontVariationSettings;
      measureSpan.style.direction = styles.direction;
      measureSpan.style.unicodeBidi = styles.unicodeBidi;
      measureSpan.style.textAlign = styles.textAlign;

      const selectionStart = target.selectionStart ?? 0;
      const selectionEnd = target.selectionEnd ?? 0;
      const isRtl = styles.direction === "rtl";
      const caretIndex =
        selectionStart === selectionEnd ||
        target.selectionDirection === "backward"
          ? selectionStart
          : selectionEnd;
      const textBeforeCaret = isPassword
        ? passwordChar.repeat(caretIndex)
        : target.value.slice(0, caretIndex);

      if (isRtl) {
        const textAfterCaret = isPassword
          ? passwordChar.repeat(target.value.length - caretIndex)
          : target.value.slice(caretIndex);
        measureSpan.replaceChildren(
          document.createTextNode(textBeforeCaret),
          caretMarker,
          document.createTextNode(textAfterCaret)
        );
      } else {
        const textNode = caretMarker.previousSibling;
        if (textNode?.nodeType === Node.TEXT_NODE) {
          textNode.textContent = textBeforeCaret;
        } else {
          measureSpan.replaceChildren(
            document.createTextNode(textBeforeCaret),
            caretMarker
          );
        }
      }
      caretMarker.style.display = "inline-block";
      caretMarker.style.width = "0px";
      const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
      const borderLeft = Number.parseFloat(styles.borderLeftWidth) || 0;

      if (isRtl) {
        measureSpan.style.boxSizing = "border-box";
        measureSpan.style.width = `${target.offsetWidth}px`;
        measureSpan.style.paddingLeft = styles.paddingLeft;
        measureSpan.style.paddingRight = styles.paddingRight;
        measureSpan.style.borderLeftWidth = styles.borderLeftWidth;
        measureSpan.style.borderRightWidth = styles.borderRightWidth;
        measureSpan.style.borderStyle = "solid";
        measureSpan.style.borderColor = "transparent";
        measureSpan.style.overflow = "hidden";
        measureSpan.scrollLeft = target.scrollLeft;

        const inputRect = target.getBoundingClientRect();
        const markerRect = caretMarker.getBoundingClientRect();
        const caretPosition = markerRect.left - inputRect.left;
        const minX = paddingLeft + borderLeft - 1;
        const maxX =
          target.clientWidth - (Number.parseFloat(styles.paddingRight) || 0);
        const isCaretVisible =
          caretPosition >= minX && caretPosition <= maxX + 1;
        const hasSelection = selectionStart !== selectionEnd;

        if (hasSelection) {
          caretOpacity.set(0);
          return;
        }

        if (!caretInitializedRef.current) {
          springCaretX.jump(caretPosition);
          caretInitializedRef.current = true;
        }
        caretX.set(caretPosition);
        caretOpacity.set(isCaretVisible ? 1 : 0);
        return;
      }

      measureSpan.style.width = "";
      measureSpan.style.paddingLeft = "";
      measureSpan.style.paddingRight = "";
      measureSpan.style.border = "";
      measureSpan.style.overflow = "";
      const absoluteWidth =
        (textBeforeCaret.length > 0 ? measureSpan.offsetWidth : -1) +
        paddingLeft +
        borderLeft;

      const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
      const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
      const visibleRight =
        target.scrollLeft + target.clientWidth - paddingRight;
      const visibleLeft = target.scrollLeft + paddingLeft;

      if (absoluteWidth > visibleRight) {
        target.scrollLeft = Math.min(
          absoluteWidth - target.clientWidth + paddingRight,
          maxScroll
        );
      } else if (absoluteWidth < visibleLeft) {
        target.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);
      }

      const caretPosition = absoluteWidth - target.scrollLeft;
      const maxX = target.clientWidth - paddingRight;
      const minX = paddingLeft + borderLeft - 1;
      const isCaretVisible = caretPosition >= minX && caretPosition <= maxX + 1;
      const hasSelection = selectionStart !== selectionEnd;

      if (hasSelection) {
        caretOpacity.set(0);
        return;
      }

      const nextCaretX = Math.min(caretPosition, maxX);
      caretX.set(nextCaretX);
      if (!caretInitializedRef.current) {
        springCaretX.jump(nextCaretX);
        caretInitializedRef.current = true;
      }
      caretOpacity.set(isCaretVisible ? 1 : 0);
    },
    [caretOpacity, caretX, springCaretX]
  );

  const updateCaretRef = useRef(updateCaretFromInput);
  updateCaretRef.current = updateCaretFromInput;
  const caretOpacityRef = useRef(caretOpacity);
  caretOpacityRef.current = caretOpacity;

  useEffect(() => {
    const input = inputRef.current;
    if (
      input &&
      document.activeElement === input &&
      input.value === inputValue
    ) {
      updateCaretRef.current(input);
    }
  }, [inputValue]);

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input && input.type === type) {
      updateCaretRef.current(input);
    }
  }, [type]);

  useEffect(() => {
    const input = inputRef.current;
    const container = containerRef.current;
    if (!(input && container)) {
      return;
    }

    const updateCaretIfFocused = () => {
      if (document.activeElement === input) {
        updateCaretRef.current(input);
      }
    };

    const handleSelectionChange = () => {
      if (document.activeElement !== input) {
        return;
      }
      requestAnimationFrame(() => {
        if (document.activeElement === input) {
          updateCaretRef.current(input);
        }
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.fonts.addEventListener("loadingdone", updateCaretIfFocused);
    document.fonts.ready.then(updateCaretIfFocused);
    input.addEventListener("scroll", updateCaretIfFocused);

    const resizeObserver = new ResizeObserver(updateCaretIfFocused);
    resizeObserver.observe(container);
    updateCaretIfFocused();

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.fonts.removeEventListener("loadingdone", updateCaretIfFocused);
      input.removeEventListener("scroll", updateCaretIfFocused);
      resizeObserver.disconnect();
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!(isControlled || isFileInput)) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
    requestAnimationFrame(() => updateCaretRef.current(event.target));
  };

  return (
    <div
      className="relative grid w-full grid-cols-1 p-0"
      ref={containerRef}
      style={{ caretColor: hasAnimatedCaret ? "transparent" : "auto" }}
    >
      <input
        {...props}
        className={cn(
          inputClassName,
          "col-start-1 col-end-2 row-start-1 row-end-2 text-inherit",
          className
        )}
        data-slot="input"
        defaultValue={isControlled || isFileInput ? undefined : defaultValue}
        onBlur={(event) => {
          caretOpacityRef.current.set(0);
          onBlur?.(event);
        }}
        onChange={handleChange}
        onFocus={(event) => {
          requestAnimationFrame(() => updateCaretRef.current(event.target));
          onFocus?.(event);
        }}
        ref={setInputRef}
        style={{
          ...props.style,
          ...(hasAnimatedCaret ? { caretColor: "transparent" } : {}),
        }}
        type={type}
        value={renderedValue}
      />
      <span
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
        ref={measureRef}
      >
        <span aria-hidden ref={caretMarkerRef} />
      </span>
      {hasAnimatedCaret && (
        <motion.div
          className="pointer-events-none absolute top-1/2 left-0 h-[0.9em] w-0.5 bg-primary"
          style={{
            x: springCaretX,
            y: "-50%",
            opacity: caretOpacity,
          }}
        />
      )}
    </div>
  );
}

export { Input };
