"use client";
import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  Children,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
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
  enabled: boolean;
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
type HandlerName = "onClick" | "onMouseEnter" | "onMouseLeave";
type OwnHandlers = Partial<
  Record<HandlerName, (event: MouseEvent<HTMLElement>) => void>
>;
const HANDLER_KEYS = ["onClick", "onMouseEnter", "onMouseLeave"] as const;
/** Hoisted so the default keeps a stable identity across renders. */
const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 35,
};
const INSTANT_TRANSITION: Transition = { duration: 0 };
type ExtendedChildProps = ComponentPropsWithoutRef<"div"> & {
  "data-highlight-value"?: string;
  ref?: Ref<HTMLElement>;
};
// ─── Helpers ──────────────────────────────────────────────────────────────────
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
/** Collapse to an instant transition for `prefers-reduced-motion: reduce`. */
function resolveTransition(
  transition: Transition,
  prefersReducedMotion: boolean | null
): Transition {
  return prefersReducedMotion ? { duration: 0 } : transition;
}
function isEqualTransition(a: Transition, b: Transition): boolean {
  if (a === b) {
    return true;
  }
  if (!(a && b)) {
    return false;
  }
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => left[key] === right[key])
  );
}
/**
 * Keeps a stable object identity while the resolved transition is shallow-equal.
 * Without this an inline `transition={{ ... }}` prop yields a new object every
 * render, which re-triggers the measuring effects — and their `setState` calls —
 * on every single pass.
 */
function useStableTransition(
  transition: Transition,
  prefersReducedMotion: boolean | null
): Transition {
  const cache = useRef<Transition | null>(null);
  const next = resolveTransition(transition, prefersReducedMotion);
  if (cache.current === null || !isEqualTransition(cache.current, next)) {
    cache.current = next;
  }
  return cache.current;
}
function assignRef<T>(
  ref: Ref<T> | undefined,
  node: T | null
): (() => void) | undefined {
  if (typeof ref === "function") {
    const cleanup = ref(node);
    return typeof cleanup === "function" ? cleanup : undefined;
  }
  if (ref) {
    (ref as RefObject<T | null>).current = node;
  }
  return;
}
/**
 * Merge the child's own ref, our measurement ref and the forwarded ref into a
 * single callback. Without this a child ref (Radix/cmdk items rely on theirs)
 * would be overwritten and the child would stop measuring itself.
 *
 * Callback-ref cleanup functions are preserved for React 19. Refs that do not
 * provide cleanup are reset to null when the composed ref detaches.
 */
function useComposedRefs<T>(
  childRef: Ref<T> | undefined,
  localRef: Ref<T> | undefined,
  forwardedRef: Ref<T> | undefined
): RefCallback<T> {
  return useCallback(
    (node) => {
      const refs = [childRef, localRef, forwardedRef];
      if (node === null) {
        for (const ref of refs) {
          assignRef(ref, null);
        }
        return;
      }
      const cleanups = refs.map((ref) => assignRef(ref, node));
      return () => {
        for (const [index, ref] of refs.entries()) {
          const cleanup = cleanups[index];
          if (cleanup) {
            cleanup();
          } else {
            assignRef(ref, null);
          }
        }
      };
    },
    [childRef, localRef, forwardedRef]
  );
}
function omitKeys(source: object, keys: readonly string[]) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (!keys.includes(key)) {
      result[key] = value;
    }
  }
  return result;
}
/**
 * Only inject the data attributes the child did not set itself, so components
 * that manage their own `data-active` state keep control of it. Selection ARIA
 * is intentionally left to the consumer because this primitive is not limited
 * to tabs or listbox options.
 */
function getNonOverridingDataAttributes<T extends Record<string, unknown>>(
  element: ReactElement<T>,
  dataAttrs: T
): T {
  const result: Record<string, unknown> = { ...dataAttrs };
  for (const key of Object.keys(dataAttrs)) {
    const own = element.props[key];
    if (own !== undefined) {
      result[key] = own;
    }
  }
  return result as T;
}
/** Run every upstream handler first so the child's own handlers always fire. */
function chainHandlers(
  own: OwnHandlers,
  ...sources: Record<string, unknown>[]
): OwnHandlers {
  const chained: OwnHandlers = {};
  for (const name of HANDLER_KEYS) {
    const handler = own[name];
    const previous = sources
      .map((source) => source[name])
      .filter(
        (fn): fn is (event: MouseEvent<HTMLElement>) => void =>
          typeof fn === "function"
      );
    if (!handler && previous.length === 0) {
      continue;
    }
    if (handler) {
      chained[name] =
        previous.length === 0
          ? handler
          : (event) => {
              for (const fn of previous) {
                fn(event);
              }
              if (!event.defaultPrevented) {
                handler(event);
              }
            };
    } else {
      chained[name] =
        previous.length === 1
          ? previous[0]
          : (event) => {
              for (const fn of previous) {
                fn(event);
              }
            };
    }
  }
  return chained;
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
interface HighlightBaseProps<T extends string> {
  /**
   * Automatically wrap child elements in `HighlightItem`.
   * Defaults to `false` (or `true` if `itemsClassName` is provided) so container
   * elements (like `<ul>`, `<NavigationMenuList>`) aren't treated as a single giant item.
   * @default false
   */
  autoWrap?: boolean;
  children: ReactNode;
  /** Classes merged onto the highlight overlay element. */
  className?: string;
  /** Uncontrolled initial active value. */
  defaultValue?: T | null;
  /** Disables every item in the group. */
  disabled?: boolean;
  /** Renders `children` untouched — no container, no wrappers, no overlay. */
  enabled?: boolean;
  /**
   * Milliseconds to hold the highlight before it starts fading out. Leave at `0`
   * unless a fast hover flickers: holding it also keeps the outgoing background
   * at full opacity while the next one slides in, and two stacked translucent
   * backgrounds read as a darker pill.
   */
  exitDelay?: number;
  /** Class applied to each auto-generated `HighlightItem` wrapper. */
  itemsClassName?: string;
  mode?: HighlightMode;
  /** Called when the active value changes. */
  onValueChange?: (value: T | null) => void;
  /** Inline styles on the highlight overlay. */
  style?: CSSProperties;
  /** Motion transition for the highlight animation. */
  transition?: Transition;
  /** What user interaction activates an item. */
  trigger?: HighlightTrigger;
  /** Controlled active value. Pass `null` to clear. */
  value?: T | null;
}
interface HighlightParentOnlyProps {
  /** Pixel offsets applied to the measured item bounds before positioning the highlight. */
  boundsOffset?: Partial<Bounds>;
  /** Classes on the relative container `div`. */
  containerClassName?: string;
}
type HighlightDivProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "className" | "style"
> & {
  /** The container `div` in `mode="parent"`. Always `null` in `mode="children"`. */
  ref?: Ref<HTMLDivElement>;
};
export type HighlightProps<T extends string = string> = HighlightDivProps &
  HighlightBaseProps<T> &
  (({ mode: "parent" } & HighlightParentOnlyProps) | { mode?: "children" });
export function Highlight<T extends string = string>({
  ref,
  children,
  mode = "children",
  trigger = "click",
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  style,
  transition = DEFAULT_TRANSITION,
  exitDelay = 0,
  disabled = false,
  enabled = true,
  itemsClassName,
  autoWrap,
  ...rest
}: HighlightProps<T>) {
  const { boundsOffset, containerClassName } = rest as HighlightParentOnlyProps;
  const containerProps = omitKeys(rest, [
    "boundsOffset",
    "containerClassName",
    "data-slot",
  ]);
  const localRef = useRef<HTMLDivElement | null>(null);
  const setContainerRef = useComposedRefs<HTMLDivElement>(
    undefined,
    localRef,
    ref
  );
  const prefersReducedMotion = useReducedMotion();
  const resolvedTransition = useStableTransition(
    transition,
    prefersReducedMotion
  );
  // `value` makes the component fully controlled: interaction only reports
  // through `onValueChange` and never moves the highlight on its own.
  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
    defaultValue ?? null
  );
  const activeValue = isControlled ? valueProp : uncontrolledValue;
  // Mirrors the effective value so uncontrolled interactions can bail out before
  // React commits the next render. In controlled mode, the prop remains the source
  // of truth and this ref must never record a selection the parent rejected.
  const activeValueRef = useRef(activeValue);
  activeValueRef.current = activeValue;
  const [boundsState, setBoundsState] = useState<Bounds | null>(null);
  const [activeClassName, setActiveClassName] = useState("");
  const [pillTransition, setPillTransition] =
    useState<Transition>(resolvedTransition);
  /** Bails out when nothing changed so an equal transition never re-renders. */
  const updatePillTransition = useCallback((next: Transition) => {
    setPillTransition((prev) => (isEqualTransition(prev, next) ? prev : next));
  }, []);
  useEffect(() => {
    if (activeValue === null) {
      setActiveClassName("");
    }
  }, [activeValue]);
  useEffect(() => {
    updatePillTransition(resolvedTransition);
  }, [resolvedTransition, updatePillTransition]);
  const setActiveValue = useCallback(
    (next: string | null) => {
      const currentValue = isControlled ? activeValue : activeValueRef.current;
      if (currentValue === next) {
        return;
      }
      if (!isControlled) {
        activeValueRef.current = next;
        setUncontrolledValue(next);
      }
      onValueChange?.(next as T | null);
    },
    [activeValue, isControlled, onValueChange]
  );
  // Keep boundsOffset always fresh without re-creating setBounds
  const boundsOffsetRef = useRef<Partial<Bounds>>(boundsOffset ?? {});
  useIsomorphicLayoutEffect(() => {
    boundsOffsetRef.current = boundsOffset ?? {};
  }, [boundsOffset]);
  const setBounds = useCallback((bounds: DOMRect) => {
    if (!localRef.current) {
      return;
    }
    const container = localRef.current;
    const cr = container.getBoundingClientRect();
    const o = boundsOffsetRef.current;
    const next: Bounds = {
      top:
        bounds.top -
        cr.top +
        container.scrollTop -
        container.clientTop +
        (o.top ?? 0),
      left:
        bounds.left -
        cr.left +
        container.scrollLeft -
        container.clientLeft +
        (o.left ?? 0),
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
  const measureActiveItem = useCallback(
    (layout = false) => {
      if (mode !== "parent" || activeValue == null || !localRef.current) {
        return;
      }
      const el = localRef.current.querySelector<HTMLElement>(
        `[data-highlight-value="${CSS.escape(activeValue)}"]`
      );
      if (el) {
        if (layout) {
          updatePillTransition(INSTANT_TRANSITION);
        }
        setBounds(el.getBoundingClientRect());
      } else {
        // The active item may have been removed without its value changing.
        clearBounds();
      }
    },
    [mode, activeValue, setBounds, clearBounds, updatePillTransition]
  );
  // Parent mode: measure when controlled selection changes (e.g. cmdk keyboard init)
  useIsomorphicLayoutEffect(() => {
    if (mode !== "parent") {
      return;
    }
    if (activeValue == null) {
      clearBounds();
      return;
    }
    updatePillTransition(resolvedTransition);
    measureActiveItem();
    const frame = requestAnimationFrame(() => measureActiveItem());
    return () => cancelAnimationFrame(frame);
  }, [
    mode,
    activeValue,
    measureActiveItem,
    clearBounds,
    resolvedTransition,
    updatePillTransition,
    boundsOffset,
  ]);
  // Parent mode: keep pill aligned while the list layout animates or resizes
  useEffect(() => {
    if (mode !== "parent" || activeValue == null) {
      return;
    }
    const container = localRef.current;
    if (!container) {
      return;
    }
    const onLayout = () => measureActiveItem(true);
    const observer = new ResizeObserver(onLayout);
    observer.observe(container);
    const activeEl = container.querySelector<HTMLElement>(
      `[data-highlight-value="${CSS.escape(activeValue)}"]`
    );
    if (activeEl) {
      observer.observe(activeEl);
    }
    return () => observer.disconnect();
  }, [mode, activeValue, measureActiveItem]);
  // Re-measure active item on scroll (parent mode only)
  useEffect(() => {
    if (mode !== "parent") {
      return;
    }
    const container = localRef.current;
    if (!container) {
      return;
    }
    const onScroll = () => {
      if (activeValue == null) {
        return;
      }
      measureActiveItem(true);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [mode, activeValue, measureActiveItem]);
  const id = useId();
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
      transition: resolvedTransition,
      disabled,
      enabled,
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
      resolvedTransition,
      disabled,
      enabled,
      exitDelay,
    ]
  );
  const shouldAutoWrap = autoWrap ?? Boolean(itemsClassName);
  const content = shouldAutoWrap
    ? Children.map(children, (child) => {
        // Never re-wrap a child that is already a HighlightItem — nesting two
        // wrappers puts the overlay inside a content-sized box and lets the outer
        // item's click handler win over the real one.
        if (isValidElement(child) && child.type !== HighlightItem) {
          return (
            <HighlightItem className={itemsClassName}>{child}</HighlightItem>
          );
        }
        return child;
      })
    : children;
  const droppedPropKeys = Object.keys(containerProps).join(",");
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || mode !== "children") {
      return;
    }
    if (droppedPropKeys) {
      console.warn(
        `[Highlight] Ignored ${droppedPropKeys} — div props are only applied to the container, which \`mode="children"\` does not render. Use \`mode="parent"\`, or \`enabled={false}\` to opt out entirely.`
      );
    }
  }, [droppedPropKeys, mode]);
  let renderedChildren: ReactNode = children;
  if (enabled) {
    if (mode === "parent") {
      renderedChildren = (
        <div
          {...containerProps}
          className={cn("relative isolate", containerClassName)}
          data-slot="highlight-container"
          ref={setContainerRef}
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
                className={cn(
                  "pointer-events-none",
                  className,
                  activeClassName
                )}
                data-slot="highlight"
                exit={{
                  opacity: 0,
                  transition: {
                    ...resolvedTransition,
                    delay: prefersReducedMotion
                      ? 0
                      : (resolvedTransition?.delay ?? 0) + exitDelay / 1000,
                  },
                }}
                initial={{
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 0,
                }}
                style={{ position: "absolute", zIndex: -1, ...style }}
                transition={pillTransition}
              />
            )}
          </AnimatePresence>
          {content}
        </div>
      );
    } else {
      renderedChildren = content;
    }
  }
  return (
    <HighlightContext.Provider value={ctx}>
      {renderedChildren}
    </HighlightContext.Provider>
  );
}
// ─── HighlightItem ────────────────────────────────────────────────────────────
interface ItemOverlayProps {
  activeClassName?: string;
  className?: string;
  contextId: string;
  contextStyle?: CSSProperties;
  style?: CSSProperties;
  transition: Transition;
}
/**
 * The decorative background for one item in `mode="children"`.
 *
 * Only the active item renders one, and it is always fully opaque. There is
 * deliberately no `initial`/`exit` fade here: crossfading two translucent
 * backgrounds never sums back to a single 8% layer, so the pill visibly shifts
 * shade mid-flight. With one opaque element carrying the shared `layoutId`,
 * Motion slides it from the previous item's bounds and the colour stays exact.
 *
 * The previous item unmounts in the same commit, which is fine — shared-layout
 * projection reads the outgoing bounds from Motion's previous-layout snapshot.
 */
function ItemOverlay({
  activeClassName,
  className,
  contextId,
  contextStyle,
  style,
  transition,
}: ItemOverlayProps) {
  return (
    <motion.div
      className={cn("pointer-events-none", className, activeClassName)}
      data-slot="highlight"
      layoutId={`highlight-${contextId}`}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        ...contextStyle,
        ...style,
      }}
      transition={transition}
    />
  );
}
export interface HighlightItemProps
  extends Omit<
    ComponentPropsWithoutRef<"div">,
    "children" | "className" | "style"
  > {
  /** Extra class applied to the highlight overlay while this item is active. */
  activeClassName?: string;
  /** Merge event handlers and refs into the child element instead of wrapping it in a `div`. */
  asChild?: boolean;
  children: ReactNode;
  /** Classes on the generated wrapper `div`, merged into the child when `asChild`. */
  className?: string;
  /** `undefined` inherits the group value; `false` keeps this item interactive. */
  disabled?: boolean;
  ref?: Ref<HTMLElement>;
  /** Inline styles on this item's local highlight overlay. */
  style?: CSSProperties;
  /** Override transition for this item's local highlight overlay. */
  transition?: Transition;
  /** Unique value identifying this item. Falls back to the child's `data-highlight-value`, then its `id`. */
  value?: string;
}
export function HighlightItem({
  ref,
  children,
  value,
  className,
  activeClassName,
  style,
  transition,
  disabled,
  asChild = false,
  ...props
}: HighlightItemProps) {
  const {
    activeValue,
    className: contextClassName,
    disabled: contextDisabled,
    enabled,
    id: contextId,
    mode,
    setActiveClassName,
    setActiveValue,
    setBounds,
    style: contextStyle,
    transition: contextTransition,
    trigger,
  } = useHighlight();
  const generatedId = useId();
  const prefersReducedMotion = useReducedMotion();
  // A Fragment cannot receive a ref, so `asChild` must bail out on it too —
  // otherwise React logs "Invalid prop `ref` supplied to `React.Fragment`".
  const isValidChild =
    isValidElement<ExtendedChildProps>(children) && children.type !== Fragment;
  const element = isValidChild ? children : null;
  const childValue =
    value ??
    element?.props["data-highlight-value"] ??
    element?.props.id ??
    generatedId;
  const isActive = activeValue === childValue;
  const isDisabled = disabled ?? contextDisabled;
  const itemTransition = useStableTransition(
    transition ?? contextTransition,
    prefersReducedMotion
  );
  const localRef = useRef<HTMLElement | null>(null);
  // Only merge the child's own ref in the `asChild` path, where we render into
  // the child itself. In the default wrapper path the child is a plain descendant
  // and must keep its own ref — handing it the wrapper node would silently
  // change what the consumer's ref points at.
  const childRef = useComposedRefs<HTMLElement>(
    element?.props.ref,
    localRef,
    ref as Ref<HTMLElement> | undefined
  );
  const wrapperRef = useComposedRefs<HTMLElement>(
    undefined,
    localRef,
    ref as Ref<HTMLElement> | undefined
  );
  // Parent mode: report this item's bounds before paint so the pill never flashes
  useIsomorphicLayoutEffect(() => {
    if (mode !== "parent") {
      return;
    }
    if (!isActive) {
      return;
    }
    const measure = () => {
      if (localRef.current) {
        setBounds(localRef.current.getBoundingClientRect());
        setActiveClassName(activeClassName ?? "");
      }
    };
    measure();
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [mode, isActive, setBounds, activeClassName, setActiveClassName]);
  if (!(enabled && isValidChild && element)) {
    return children;
  }
  const dataAttrs = {
    "data-active": isActive ? "true" : "false",
    "data-disabled": isDisabled || undefined,
    "data-highlight-value": childValue,
  };
  let ownHandlers: OwnHandlers = {};
  if (!isDisabled) {
    ownHandlers =
      trigger === "hover"
        ? {
            onMouseEnter: () => setActiveValue(childValue),
            onMouseLeave: () => setActiveValue(null),
          }
        : { onClick: () => setActiveValue(childValue) };
  }
  // In wrapper mode the child's handlers already run on the child and bubble up.
  // Re-chaining them onto the wrapper would invoke them a second time.
  const handlers = asChild
    ? chainHandlers(
        ownHandlers,
        element.props as Record<string, unknown>,
        props as Record<string, unknown>
      )
    : chainHandlers(ownHandlers, props as Record<string, unknown>);
  const restProps = omitKeys(props, HANDLER_KEYS);
  // Shared highlight overlay (children mode only)
  const overlay =
    mode === "children" && isActive && !isDisabled ? (
      <ItemOverlay
        activeClassName={activeClassName}
        className={contextClassName}
        contextId={contextId}
        contextStyle={contextStyle}
        style={style}
        transition={itemTransition}
      />
    ) : null;
  // asChild: inject directly into the child element
  if (asChild) {
    if (mode === "children") {
      return cloneElement(
        element,
        {
          ...restProps,
          className: cn("relative isolate", element.props.className, className),
          ref: childRef,
          ...getNonOverridingDataAttributes(element, dataAttrs),
          ...handlers,
        },
        overlay,
        element.props.children
      );
    }
    return cloneElement(element, {
      ...restProps,
      ref: childRef,
      ...getNonOverridingDataAttributes(element, dataAttrs),
      ...handlers,
    });
  }
  // Default: wrapper div
  return (
    <div
      className={cn(mode === "children" && "relative isolate flex", className)}
      data-slot="highlight-item"
      ref={wrapperRef as RefCallback<HTMLDivElement>}
      {...dataAttrs}
      {...restProps}
      {...handlers}
    >
      {overlay}
      {mode === "children" ? (
        // `w-full` matters: the wrapper is a flex container, so without it this
        // inner box would size to its content and any `w-full` / `justify-*`
        // utility on the child would collapse instead of filling the row.
        <div className="relative z-1 w-full">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
export { useHighlight };
