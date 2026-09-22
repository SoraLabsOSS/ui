/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: The wrapper mirrors hover/focus state for arbitrary trigger children. */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: The wrapper mirrors hover/focus state for arbitrary trigger children. */

"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type TooltipSide = "bottom" | "top";

interface AnimatedTooltipProps
  extends Omit<React.ComponentProps<"div">, "content"> {
  /** Content displayed while the trigger is hovered or focused. */
  content: React.ReactNode;
  /** Additional classes for the tooltip surface. */
  contentClassName?: string;
  /** Side where the tooltip is rendered. @default "top" */
  side?: TooltipSide;
  /** Distance between the trigger and tooltip in pixels. @default 10 */
  sideOffset?: number;
}

type AnimatedTooltipGroupProps = React.ComponentProps<"div">;

interface RegisteredTooltip {
  content: React.ReactNode;
  contentClassName?: string;
  id: string;
  side: TooltipSide;
  sideOffset: number;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

interface TooltipRow {
  id: string;
  items: RegisteredTooltip[];
}

interface AnimatedTooltipGroupContextValue {
  activeId: string | null;
  hide: (id: string) => void;
  register: (item: RegisteredTooltip) => () => void;
  show: (id: string) => void;
  tooltipId: string;
}

const AnimatedTooltipGroupContext =
  createContext<AnimatedTooltipGroupContextValue | null>(null);

const SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

function AnimatedTooltipGroup({
  children,
  className,
  onPointerLeave: onPointerLeaveProp,
  ...props
}: AnimatedTooltipGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const tooltipRefs = useRef(new Map<string, HTMLDivElement>());
  const activeIdRef = useRef<string | null>(null);
  const activeRowRef = useRef<string | null>(null);
  const hasShownTooltipRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [items, setItems] = useState<RegisteredTooltip[]>([]);
  const [rows, setRows] = useState<TooltipRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [stripWidth, setStripWidth] = useState(0);
  const reducedMotion = useReducedMotion();
  const tooltipId = useId();
  const spring = reducedMotion ? { stiffness: 1000, damping: 1000 } : SPRING;

  const stripPosition = useSpring(0, spring);
  const stripVerticalPosition = useSpring(0, spring);
  const clipPathLeft = useSpring(0, spring);
  const clipPathRight = useSpring(0, spring);
  const opacity = useSpring(0, spring);

  const register = useCallback((item: RegisteredTooltip) => {
    setItems((current) => {
      const existing = current.findIndex((entry) => entry.id === item.id);
      if (existing === -1) {
        return [...current, item];
      }

      const next = [...current];
      next[existing] = item;
      return next;
    });

    return () => {
      tooltipRefs.current.delete(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    };
  }, []);

  const measureRows = useCallback(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const nextRows: TooltipRow[] = [];
    let previousTop: number | null = null;

    for (const item of items) {
      const top = item.triggerRef.current?.getBoundingClientRect().top;
      if (top === undefined) {
        continue;
      }

      if (previousTop === null || Math.abs(top - previousTop) > 1) {
        nextRows.push({ id: `row-${nextRows.length}`, items: [] });
        previousTop = top;
      }

      nextRows.at(-1)?.items.push(item);
    }

    setRows(nextRows);
  }, [items]);

  useLayoutEffect(() => {
    measureRows();
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const observer = new ResizeObserver(measureRows);
    observer.observe(group);
    return () => observer.disconnect();
  }, [measureRows]);

  const show = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Positioning and transition states share one hover handler.
    (id: string) => {
      const group = groupRef.current;
      const item = items.find((entry) => entry.id === id);
      const trigger = item?.triggerRef.current;
      const row = rows.find((entry) =>
        entry.items.some((rowItem) => rowItem.id === id)
      );

      if (!(group && item && trigger && row)) {
        return;
      }

      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (rowFadeTimeoutRef.current !== null) {
        clearTimeout(rowFadeTimeoutRef.current);
        rowFadeTimeoutRef.current = null;
      }

      const index = row.items.findIndex((rowItem) => rowItem.id === id);
      const activeTooltip = tooltipRefs.current.get(id);
      if (!activeTooltip) {
        return;
      }

      const groupRect = group.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const activeTooltipRect = activeTooltip.getBoundingClientRect();
      let leftWidth = 0;
      for (let i = 0; i < index; i++) {
        leftWidth +=
          tooltipRefs.current.get(row.items[i].id)?.getBoundingClientRect()
            .width ?? 0;
      }

      const totalWidth = row.items.reduce(
        (sum, rowItem) =>
          sum +
          (tooltipRefs.current.get(rowItem.id)?.getBoundingClientRect().width ??
            0),
        0
      );
      const rightWidth = totalWidth - leftWidth - activeTooltipRect.width;
      const maxWidth = Math.max(
        ...rows.map((rowItem) =>
          rowItem.items.reduce(
            (sum, rowItem) =>
              sum +
              (tooltipRefs.current.get(rowItem.id)?.getBoundingClientRect()
                .width ?? 0),
            0
          )
        ),
        totalWidth
      );
      const centerX = triggerRect.left + triggerRect.width / 2;
      const tooltipCenterX =
        groupRect.left + leftWidth + activeTooltipRect.width / 2;
      const nextX = centerX - tooltipCenterX;
      const nextY =
        item.side === "top"
          ? triggerRect.top -
            groupRect.top -
            item.sideOffset -
            activeTooltipRect.height
          : triggerRect.bottom - groupRect.top + item.sideOffset;
      const nextClipLeft = leftWidth;
      const nextClipRight = maxWidth - totalWidth + rightWidth;
      const firstShow = !hasShownTooltipRef.current;
      const rowChanged = activeRowRef.current !== row.id;

      if (firstShow) {
        stripPosition.jump(nextX);
        stripVerticalPosition.jump(nextY);
        clipPathLeft.jump(nextClipLeft);
        clipPathRight.jump(nextClipRight);
        hasShownTooltipRef.current = true;
      } else if (rowChanged) {
        stripPosition.jump(nextX);
        clipPathLeft.jump(nextClipLeft);
        clipPathRight.jump(nextClipRight);
        stripVerticalPosition.jump(nextY);
        opacity.jump(0);
      } else {
        stripPosition.set(nextX);
        stripVerticalPosition.set(nextY);
        clipPathLeft.set(nextClipLeft);
        clipPathRight.set(nextClipRight);
      }

      activeIdRef.current = id;
      activeRowRef.current = row.id;
      setStripWidth(maxWidth);
      setActiveId(id);
      setActiveRowId(row.id);
      if (firstShow || !rowChanged) {
        opacity.set(1);
      } else {
        rowFadeTimeoutRef.current = setTimeout(() => {
          if (activeIdRef.current === id) {
            opacity.set(1);
          }
          rowFadeTimeoutRef.current = null;
        }, 40);
      }
    },
    [
      clipPathLeft,
      clipPathRight,
      items,
      opacity,
      rows,
      stripPosition,
      stripVerticalPosition,
    ]
  );

  const hide = useCallback(
    (id: string) => {
      if (activeIdRef.current !== id) {
        return;
      }

      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (rowFadeTimeoutRef.current !== null) {
        clearTimeout(rowFadeTimeoutRef.current);
        rowFadeTimeoutRef.current = null;
      }

      hideTimeoutRef.current = setTimeout(() => {
        if (activeIdRef.current === id) {
          activeIdRef.current = null;
          opacity.set(0);
          setActiveId(null);
        }
        hideTimeoutRef.current = null;
      }, 0);
    },
    [opacity]
  );

  const clipPath = useMotionTemplate`inset(0 ${clipPathRight}px 0 ${clipPathLeft}px round 10px)`;
  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeaveProp?.(event);
    if (activeIdRef.current) {
      hide(activeIdRef.current);
    }
  };

  return (
    <AnimatedTooltipGroupContext.Provider
      value={{ activeId, hide, register, show, tooltipId }}
    >
      <div
        className={cn("relative", className)}
        onPointerLeave={handlePointerLeave}
        ref={groupRef}
        {...props}
      >
        {children}
        <div
          aria-hidden={!activeId}
          className="pointer-events-none absolute top-0 left-0 z-50"
          id={tooltipId}
          role="tooltip"
        >
          {rows.map((row) => (
            <div
              aria-hidden
              className="invisible absolute top-0 left-0 flex w-max"
              key={row.id}
            >
              {row.items.map((item) => (
                <div
                  className="z-1 inline-flex h-8 items-center justify-center"
                  key={item.id}
                  ref={(element) => {
                    if (element) {
                      tooltipRefs.current.set(item.id, element);
                    } else {
                      tooltipRefs.current.delete(item.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center gap-2 whitespace-nowrap px-2 font-medium text-background text-sm leading-tight tracking-tight",
                      item.contentClassName
                    )}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <motion.div
            className="absolute top-0 left-0 flex bg-foreground"
            style={{
              clipPath,
              opacity,
              width: stripWidth,
              x: stripPosition,
              y: stripVerticalPosition,
            }}
          >
            {rows
              .find((row) => row.id === activeRowId)
              ?.items.map((item) => (
                <div
                  className="z-1 inline-flex h-8 items-center justify-center"
                  key={item.id}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center gap-2 whitespace-nowrap px-2 font-medium text-background text-sm leading-tight tracking-tight",
                      item.contentClassName
                    )}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
          </motion.div>
        </div>
      </div>
    </AnimatedTooltipGroupContext.Provider>
  );
}

function AnimatedTooltip({
  children,
  className,
  content,
  contentClassName,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  onPointerEnter: onPointerEnterProp,
  onPointerLeave: onPointerLeaveProp,
  side = "top",
  sideOffset = 10,
  ...props
}: AnimatedTooltipProps) {
  const group = useContext(AnimatedTooltipGroupContext);
  const register = group?.register;
  const tooltipId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!register) {
      return;
    }

    return register({
      content,
      contentClassName,
      id: tooltipId,
      side,
      sideOffset,
      triggerRef,
    });
  }, [content, contentClassName, register, side, sideOffset, tooltipId]);

  const show = () => {
    group?.show(tooltipId);
  };

  const hide = () => {
    group?.hide(tooltipId);
  };

  return (
    <div
      aria-describedby={
        group?.activeId === tooltipId ? group.tooltipId : undefined
      }
      className={cn("relative inline-flex", className)}
      onBlur={(event) => {
        onBlurProp?.(event);
        if (
          !(
            event.relatedTarget &&
            event.currentTarget.contains(event.relatedTarget as Node)
          )
        ) {
          hide();
        }
      }}
      onFocus={(event) => {
        onFocusProp?.(event);
        show();
      }}
      onPointerEnter={(event) => {
        onPointerEnterProp?.(event);
        show();
      }}
      onPointerLeave={(event) => {
        onPointerLeaveProp?.(event);
      }}
      ref={triggerRef}
      {...props}
    >
      {children}
    </div>
  );
}

export type { AnimatedTooltipGroupProps, AnimatedTooltipProps };
export { AnimatedTooltip, AnimatedTooltipGroup };
