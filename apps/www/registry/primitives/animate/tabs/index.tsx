"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type HTMLMotionProps,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import type * as React from "react";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getStrictContext } from "@/registry/lib/get-strict-context";
import { Slot, type WithAsChild } from "@/registry/primitives/animate/slot";
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/registry/primitives/effects/highlight";

interface TabsStateContextType {
  activeValue: string;
}

interface TabsPrewarmContextType {
  prewarmedValues: Set<string>;
}

interface TabsActionsContextType {
  handleValueChange: (value: string) => void;
  prewarmValue: (value: string) => void;
  registerTrigger: (value: string, node: HTMLElement | null) => void;
}

interface TabsContextType
  extends TabsStateContextType,
    TabsPrewarmContextType,
    TabsActionsContextType {}

const [TabsStateProvider, useTabsState] =
  getStrictContext<TabsStateContextType>("TabsStateContext");

const [TabsPrewarmProvider, useTabsPrewarm] =
  getStrictContext<TabsPrewarmContextType>("TabsPrewarmContext");

const [TabsActionsProvider, useTabsActions] =
  getStrictContext<TabsActionsContextType>("TabsActionsContext");

function useTabs(): TabsContextType {
  const state = useTabsState();
  const prewarm = useTabsPrewarm();
  const actions = useTabsActions();

  return {
    ...state,
    ...prewarm,
    ...actions,
  };
}

type BaseTabsProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

type UnControlledTabsProps = BaseTabsProps & {
  defaultValue?: string;
  value?: never;
  onValueChange?: never;
};

type ControlledTabsProps = BaseTabsProps & {
  value: string;
  onValueChange?: (value: string) => void;
  defaultValue?: never;
};

type TabsProps = UnControlledTabsProps | ControlledTabsProps;

function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const [activeValue, setActiveValue] = useState<string | undefined>(
    defaultValue
  );
  const [prewarmedValues, setPrewarmedValues] = useState<Set<string>>(
    () => new Set()
  );
  const triggersRef = useRef(new Map<string, HTMLElement>());
  const initialSet = useRef(false);
  const isControlled = value !== undefined;
  const activeValueRef = useRef(activeValue);
  activeValueRef.current = activeValue;

  const prewarmValue = useCallback((val: string) => {
    setPrewarmedValues((prev) => {
      if (prev.has(val)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(val);
      return next;
    });
  }, []);

  useEffect(() => {
    if (
      !isControlled &&
      activeValue === undefined &&
      triggersRef.current.size > 0 &&
      !initialSet.current
    ) {
      const firstTab = triggersRef.current.keys().next().value as
        | string
        | undefined;
      if (firstTab !== undefined) {
        setActiveValue(firstTab);
        initialSet.current = true;
      }
    }
  }, [activeValue, isControlled]);

  const registerTrigger = useCallback(
    (val: string, node: HTMLElement | null) => {
      if (node) {
        triggersRef.current.set(val, node);
        if (
          !isControlled &&
          activeValueRef.current === undefined &&
          !initialSet.current
        ) {
          setActiveValue(val);
          initialSet.current = true;
        }
      } else {
        triggersRef.current.delete(val);
      }
    },
    [isControlled]
  );

  const handleValueChange = useCallback(
    (val: string) => {
      setPrewarmedValues(new Set());
      if (isControlled) {
        onValueChange?.(val);
      } else {
        setActiveValue(val);
      }
    },
    [isControlled, onValueChange]
  );

  const stateContextValue = useMemo(
    () => ({ activeValue: (value ?? activeValue) as string }),
    [value, activeValue]
  );

  const prewarmContextValue = useMemo(
    () => ({ prewarmedValues }),
    [prewarmedValues]
  );

  const actionsContextValue = useMemo(
    () => ({
      handleValueChange,
      prewarmValue,
      registerTrigger,
    }),
    [handleValueChange, prewarmValue, registerTrigger]
  );

  return (
    <TabsStateProvider value={stateContextValue}>
      <TabsPrewarmProvider value={prewarmContextValue}>
        <TabsActionsProvider value={actionsContextValue}>
          <div data-slot="tabs" {...props}>
            {children}
          </div>
        </TabsActionsProvider>
      </TabsPrewarmProvider>
    </TabsStateProvider>
  );
}

type TabsHighlightProps = Omit<HighlightProps, "value"> & {
  containerClassName?: string;
};

function TabsHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: TabsHighlightProps) {
  const { activeValue } = useTabsState();

  return (
    <Highlight
      {...(props.mode === "parent" ? { "data-slot": "tabs-highlight" } : {})}
      transition={transition}
      value={activeValue}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

function TabsList(props: TabsListProps) {
  return <div data-slot="tabs-list" role="tablist" {...props} />;
}

type TabsHighlightItemProps = HighlightItemProps & {
  value: string;
};

function TabsHighlightItem(props: TabsHighlightItemProps) {
  return <HighlightItem data-slot="tabs-highlight-item" {...props} />;
}

type TabsTriggerProps = WithAsChild<
  {
    value: string;
    children: React.ReactNode;
  } & HTMLMotionProps<"button">
>;

function TabsTrigger({
  ref,
  value,
  asChild = false,
  onMouseEnter,
  onFocus,
  ...props
}: TabsTriggerProps) {
  const { activeValue } = useTabsState();
  const { handleValueChange, registerTrigger, prewarmValue } = useTabsActions();

  const localRef = useRef<HTMLButtonElement | null>(null);
  useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

  useEffect(() => {
    registerTrigger(value, localRef.current);
    return () => registerTrigger(value, null);
  }, [value, registerTrigger]);

  const Component = asChild ? Slot : motion.button;

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    prewarmValue?.(value);
    onMouseEnter?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    prewarmValue?.(value);
    onFocus?.(e);
  };

  return (
    <Component
      data-slot="tabs-trigger"
      data-state={activeValue === value ? "active" : "inactive"}
      onClick={() => handleValueChange(value)}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      ref={localRef}
      role="tab"
      {...props}
    />
  );
}

type TabsContentsProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  transition?: Transition;
  /**
   * Whether to lazily mount tabs only when active or prewarmed.
   * Inactive tabs won't render their subtree until first visited.
   * @default true
   */
  lazyMount?: boolean;
  /**
   * Whether to keep previously visited tabs mounted in the DOM.
   * If false, tabs are unmounted when leaving (after animation completes).
   * @default true
   */
  keepMounted?: boolean;
  /**
   * Whether to animate container height when switching tabs.
   * @default true
   */
  animateHeight?: boolean;
};

function TabsContents({
  children,
  transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  lazyMount = true,
  keepMounted = true,
  animateHeight = true,
  onAnimationComplete,
  ...props
}: TabsContentsProps) {
  const { activeValue } = useTabsState();
  const { prewarmedValues } = useTabsPrewarm();
  const prefersReducedMotion = useReducedMotion();
  const childrenArray = Children.toArray(children);
  const activeIndex = childrenArray.findIndex(
    (child): child is React.ReactElement<{ value: string }> =>
      isValidElement(child) &&
      typeof child.props === "object" &&
      child.props !== null &&
      "value" in child.props &&
      child.props.value === activeValue
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [height, setHeight] = useState(0);
  const roRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  const [animatingFrom, setAnimatingFrom] = useState<number | null>(null);
  const prevActiveRef = useRef(activeIndex);

  const isSwitching = prevActiveRef.current !== activeIndex;
  const effectiveAnimatingFrom = isSwitching
    ? prevActiveRef.current
    : animatingFrom;

  useLayoutEffect(() => {
    if (prevActiveRef.current !== activeIndex) {
      setAnimatingFrom(prevActiveRef.current);
      prevActiveRef.current = activeIndex;
    }
  }, [activeIndex]);

  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(
    () => new Set(activeIndex >= 0 ? [activeIndex] : [0])
  );

  useEffect(() => {
    if (activeIndex >= 0) {
      setVisitedIndices((prev) => {
        if (prev.has(activeIndex)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(activeIndex);
        return next;
      });
    }
  }, [activeIndex]);

  const scheduleHeight = useCallback((next: number) => {
    if (next <= 0) {
      return;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setHeight((prev) => (Math.abs(prev - next) > 0.5 ? next : prev));
    });
  }, []);

  const measure = useCallback((index: number) => {
    const pane = itemRefs.current[index];
    const container = containerRef.current;
    if (!(pane && container)) {
      return 0;
    }

    const base = pane.getBoundingClientRect().height || 0;

    const cs = getComputedStyle(container);
    const isBorderBox = cs.boxSizing === "border-box";
    const paddingY =
      (Number.parseFloat(cs.paddingTop || "0") || 0) +
      (Number.parseFloat(cs.paddingBottom || "0") || 0);
    const borderY =
      (Number.parseFloat(cs.borderTopWidth || "0") || 0) +
      (Number.parseFloat(cs.borderBottomWidth || "0") || 0);

    let total = base + (isBorderBox ? paddingY + borderY : 0);

    const dpr =
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    total = Math.ceil(total * dpr) / dpr;

    return total;
  }, []);

  useLayoutEffect(() => {
    if (!animateHeight) {
      return;
    }
    if (activeIndex >= 0) {
      const next = measure(activeIndex);
      if (next > 0) {
        setHeight((prev) => (Math.abs(prev - next) > 0.5 ? next : prev));
      }
    }
  }, [activeIndex, animateHeight, measure]);

  useEffect(() => {
    if (!animateHeight) {
      return;
    }
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }

    const pane = itemRefs.current[activeIndex];
    if (!pane) {
      return;
    }

    const ro = new ResizeObserver(() => {
      scheduleHeight(measure(activeIndex));
    });

    ro.observe(pane);

    roRef.current = ro;
    return () => {
      ro.disconnect();
      roRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activeIndex, animateHeight, measure, scheduleHeight]);

  const isInitialRef = useRef(true);

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const contentsTransition = prefersReducedMotion
    ? { duration: 0 }
    : transition;

  const heightTransition: Transition =
    prefersReducedMotion || isInitialRef.current || !animateHeight
      ? { duration: 0 }
      : ((transition as { height?: Transition })?.height ?? {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        });

  const handleAnimationComplete: HTMLMotionProps<"div">["onAnimationComplete"] =
    (definition) => {
      setAnimatingFrom(null);
      onAnimationComplete?.(definition);
    };

  return (
    <motion.div
      animate={{ height: animateHeight ? height || "auto" : "auto" }}
      data-slot="tabs-contents"
      initial={false}
      ref={containerRef}
      style={{ overflow: "hidden" }}
      transition={heightTransition}
      {...props}
    >
      <motion.div
        animate={{ x: `${activeIndex * -100}%` }}
        className="-mx-2 flex items-start"
        initial={{ x: `${activeIndex * -100}%` }}
        onAnimationComplete={handleAnimationComplete}
        style={{ willChange: "transform" }}
        transition={contentsTransition}
      >
        {childrenArray.map((child, index) => {
          const tabKey = isValidElement(child)
            ? (child.key ?? `tab-pane-${index}`)
            : `tab-pane-${index}`;

          const isVisible =
            index === activeIndex || index === effectiveAnimatingFrom;

          const tabValue =
            isValidElement(child) &&
            typeof child.props === "object" &&
            child.props !== null &&
            "value" in child.props
              ? String(child.props.value)
              : undefined;

          const isPrewarmed =
            tabValue !== undefined && prewarmedValues?.has(tabValue);

          const shouldMount =
            !lazyMount ||
            index === activeIndex ||
            index === effectiveAnimatingFrom ||
            (keepMounted && visitedIndices.has(index)) ||
            isPrewarmed;

          return (
            <div
              className={cn(
                "w-full shrink-0 px-2",
                !isVisible && "h-0 overflow-hidden"
              )}
              key={tabKey}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
            >
              {shouldMount ? child : null}
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

type TabsContentProps = WithAsChild<
  {
    value: string;
    children: React.ReactNode;
  } & HTMLMotionProps<"div">
>;

function TabsContent({
  ref,
  value,
  style,
  asChild = false,
  ...props
}: TabsContentProps) {
  const { activeValue } = useTabsState();
  const isActive = activeValue === value;

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      data-slot="tabs-content"
      data-state={isActive ? "active" : "inactive"}
      inert={!isActive}
      ref={ref}
      role="tabpanel"
      style={style}
      {...props}
    />
  );
}

export {
  Tabs,
  type TabsActionsContextType,
  TabsContent,
  type TabsContentProps,
  TabsContents,
  type TabsContentsProps,
  type TabsContextType,
  TabsHighlight,
  TabsHighlightItem,
  type TabsHighlightItemProps,
  type TabsHighlightProps,
  TabsList,
  type TabsListProps,
  type TabsPrewarmContextType,
  type TabsProps,
  type TabsStateContextType,
  TabsTrigger,
  type TabsTriggerProps,
  useTabs,
  useTabsActions,
  useTabsPrewarm,
  useTabsState,
};
