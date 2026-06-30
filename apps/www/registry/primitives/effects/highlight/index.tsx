"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion, type Transition } from "motion/react";
import {
  type CSSProperties,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefCallback,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HighlightMode = "children" | "parent";
type HighlightTrigger = "hover" | "click";

interface Bounds {
  height: number;
  left: number;
  top: number;
  width: number;
}

interface HighlightContextValue {
  activeClassName: string;
  activeValue: string | null;
  className?: string;
  clearBounds: () => void;
  disabled: boolean;
  exitDelay: number;
  id: string;
  mode: HighlightMode;
  setActiveClassName: (className: string) => void;
  setActiveValue: (value: string | null) => void;
  setBounds: (bounds: DOMRect) => void;
  style?: CSSProperties;
  transition: Transition;
  trigger: HighlightTrigger;
}

const HighlightContext = createContext<HighlightContextValue | undefined>(
  undefined
);

function useHighlight(): HighlightContextValue {
  const ctx = useContext(HighlightContext);
  if (!ctx) {
    throw new Error("useHighlight must be used within a Highlight");
  }
  return ctx;
}

// ─── Highlight ────────────────────────────────────────────────────────────────

interface HighlightBaseProps {
  children: ReactNode;
  className?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  /** Milliseconds to delay the exit fade. Useful for hover mode to prevent flicker. */
  exitDelay?: number;
  mode?: HighlightMode;
  onValueChange?: (value: string | null) => void;
  style?: CSSProperties;
  transition?: Transition;
  trigger?: HighlightTrigger;
  value?: string | null;
}

interface HighlightParentOnlyProps {
  boundsOffset?: Partial<Bounds>;
  containerClassName?: string;
}

export type HighlightProps = HighlightBaseProps &
  (({ mode: "parent" } & HighlightParentOnlyProps) | { mode?: "children" });

export function Highlight({
  children,
  mode = "children",
  trigger = "click",
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  style,
  transition = { type: "spring", stiffness: 350, damping: 35 },
  exitDelay = 0,
  disabled = false,
  ...rest
}: HighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeValue, setActiveValueState] = useState<string | null>(
    valueProp === undefined ? (defaultValue ?? null) : valueProp
  );
  const [boundsState, setBoundsState] = useState<Bounds | null>(null);
  const [activeClassName, setActiveClassName] = useState("");

  useEffect(() => {
    if (valueProp !== undefined) {
      setActiveValueState(valueProp);
    }
  }, [valueProp]);

  const setActiveValue = useCallback(
    (id: string | null) => {
      setActiveValueState((prev) => {
        if (prev === id) {
          return prev;
        }
        onValueChange?.(id);
        return id;
      });
    },
    [onValueChange]
  );

  // Keep boundsOffset always fresh without re-creating setBounds
  const boundsOffsetRef = useRef<Partial<Bounds>>(
    (rest as HighlightParentOnlyProps).boundsOffset ?? {}
  );
  useEffect(() => {
    boundsOffsetRef.current =
      (rest as HighlightParentOnlyProps).boundsOffset ?? {};
  });

  const setBounds = useCallback((bounds: DOMRect) => {
    if (!containerRef.current) {
      return;
    }
    const cr = containerRef.current.getBoundingClientRect();
    const o = boundsOffsetRef.current;
    const next: Bounds = {
      top: bounds.top - cr.top + (o.top ?? 0),
      left: bounds.left - cr.left + (o.left ?? 0),
      width: bounds.width + (o.width ?? 0),
      height: bounds.height + (o.height ?? 0),
    };
    setBoundsState((prev) => {
      if (
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const clearBounds = useCallback(
    () => setBoundsState((prev) => (prev === null ? prev : null)),
    []
  );

  // Re-measure active item on scroll (parent mode only)
  useEffect(() => {
    if (mode !== "parent") {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const onScroll = () => {
      if (!activeValue) {
        return;
      }
      const el = container.querySelector<HTMLElement>(
        `[data-highlight-value="${activeValue}"]`
      );
      if (el) {
        setBounds(el.getBoundingClientRect());
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [mode, activeValue, setBounds]);

  const id = useId();
  const containerClassName = (rest as HighlightParentOnlyProps)
    .containerClassName;

  const ctx = useMemo<HighlightContextValue>(
    () => ({
      mode,
      trigger,
      activeValue,
      setActiveValue,
      setBounds,
      clearBounds,
      id,
      className,
      style,
      activeClassName,
      setActiveClassName,
      transition,
      disabled,
      exitDelay,
    }),
    [
      mode,
      trigger,
      activeValue,
      setActiveValue,
      setBounds,
      clearBounds,
      id,
      className,
      style,
      activeClassName,
      transition,
      disabled,
      exitDelay,
    ]
  );

  return (
    <HighlightContext.Provider value={ctx}>
      {mode === "parent" ? (
        <div
          className={cn("relative", containerClassName)}
          data-slot="highlight-container"
          ref={containerRef}
        >
          <AnimatePresence initial={false}>
            {boundsState && (
              <motion.div
                animate={{
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 1,
                }}
                className={cn(className, activeClassName)}
                data-slot="highlight"
                exit={{
                  opacity: 0,
                  transition: {
                    ...transition,
                    delay: (transition?.delay ?? 0) + exitDelay / 1000,
                  },
                }}
                initial={{
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 0,
                }}
                style={{ position: "absolute", zIndex: 0, ...style }}
                transition={transition}
              />
            )}
          </AnimatePresence>
          {children}
        </div>
      ) : (
        children
      )}
    </HighlightContext.Provider>
  );
}

// ─── HighlightItem ────────────────────────────────────────────────────────────

export interface HighlightItemProps {
  /** Extra class applied to the highlight overlay when this item is active. */
  activeClassName?: string;
  /** Merge event handlers and refs into the child element instead of wrapping. */
  asChild?: boolean;
  children: ReactElement;
  /** Class on the highlight overlay (children mode). Merged with Highlight className. */
  className?: string;
  disabled?: boolean;
  style?: CSSProperties;
  /** Override transition for this item (children mode). */
  transition?: Transition;
  /** Unique value identifying this item. */
  value: string;
}

export function HighlightItem({
  children,
  value,
  disabled = false,
  activeClassName,
  className,
  style,
  transition,
  asChild = false,
}: HighlightItemProps) {
  const {
    activeValue,
    setActiveValue,
    mode,
    trigger,
    setBounds,
    clearBounds,
    disabled: ctxDisabled,
    className: ctxClassName,
    style: ctxStyle,
    transition: ctxTransition,
    id: ctxId,
    exitDelay: ctxExitDelay,
    setActiveClassName,
  } = useHighlight();

  const localRef = useRef<HTMLElement | null>(null);
  const refCallback = useCallback<RefCallback<HTMLElement>>((node) => {
    localRef.current = node;
  }, []);

  const isActive = activeValue === value;
  const isDisabled = disabled || ctxDisabled;
  const itemTransition = transition ?? ctxTransition;

  // Parent mode: report this item's bounds when it becomes active
  useEffect(() => {
    if (mode !== "parent") {
      return;
    }
    if (isActive && localRef.current) {
      setBounds(localRef.current.getBoundingClientRect());
      setActiveClassName(activeClassName ?? "");
    } else if (!activeValue) {
      clearBounds();
    }
  }, [
    mode,
    isActive,
    activeValue,
    setBounds,
    clearBounds,
    activeClassName,
    setActiveClassName,
  ]);

  const handlers = useMemo(() => {
    if (isDisabled) {
      return {};
    }
    if (trigger === "hover") {
      return {
        onMouseEnter: () => setActiveValue(value),
        onMouseLeave: () => setActiveValue(null),
      };
    }
    return {
      onClick: () => setActiveValue(value),
    };
  }, [trigger, isDisabled, setActiveValue, value]);

  if (!isValidElement(children)) {
    return children;
  }

  const dataAttrs = {
    "data-active": isActive ? "true" : "false",
    "aria-selected": isActive,
    "data-disabled": isDisabled || undefined,
    "data-highlight-value": value,
  };

  // Shared highlight overlay (children mode only)
  const overlay =
    mode === "children" ? (
      <AnimatePresence initial={false}>
        {isActive && !isDisabled && (
          <motion.div
            animate={{ opacity: 1 }}
            className={cn(ctxClassName, activeClassName, className)}
            data-slot="highlight"
            exit={{
              opacity: 0,
              transition: {
                ...itemTransition,
                delay:
                  (itemTransition?.delay ?? 0) + (ctxExitDelay ?? 0) / 1000,
              },
            }}
            initial={{ opacity: 0 }}
            layoutId={`highlight-${ctxId}`}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              ...ctxStyle,
              ...style,
            }}
            transition={itemTransition}
          />
        )}
      </AnimatePresence>
    ) : null;

  // asChild: inject directly into the child element
  if (asChild) {
    // biome-ignore lint/suspicious/noExplicitAny: element props are dynamic at runtime
    const el = children as ReactElement<any>;

    if (mode === "children") {
      return cloneElement(
        el,
        {
          ...el.props,
          ref: refCallback,
          className: cn("relative", el.props.className),
          ...dataAttrs,
          ...handlers,
        },
        overlay,
        el.props.children
      );
    }

    return cloneElement(el, {
      ...el.props,
      ref: refCallback,
      ...dataAttrs,
      ...handlers,
    });
  }

  // Default: wrapper div
  return (
    <div
      className={cn(mode === "children" && "relative")}
      data-slot="highlight-item"
      ref={refCallback as RefCallback<HTMLDivElement>}
      {...dataAttrs}
      {...handlers}
    >
      {overlay}
      {mode === "children" ? (
        <div className="relative z-1">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

export { useHighlight };
