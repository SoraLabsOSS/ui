"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import type { ComponentType, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import useMeasure from "react-use-measure";

export interface ExpandableTab {
  /** Panel content rendered when this tab is selected. */
  content: ReactNode;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
  id: string;
  label: string;
}

export interface ExpandableTabsClassNames {
  /** Merged onto the content wrapper shown while a tab is open. */
  content?: string;
  /** Merged onto the revealed label span inside the active tab button. */
  label?: string;
  /** Merged onto the outermost element. */
  root?: string;
  /** Merged onto the pill shell (background, rounding, border). */
  toolbar?: string;
  /** Merged onto every tab button. */
  trigger?: string;
  /** Merged onto the currently active tab button, in addition to `trigger`. */
  triggerActive?: string;
}

export interface ExpandableTabsProps {
  className?: string;
  classNames?: ExpandableTabsClassNames;
  /** Uncontrolled initial selected tab id. @default null */
  defaultSelectedId?: string | null;
  /** Delay in seconds before an active tab's label starts revealing. @default 0.08 */
  labelDelay?: number;
  /** Maximum width of the open content panel (CSS value). @default "24rem" */
  maxContentWidth?: string;
  /** Called whenever the selected tab id changes (controlled or uncontrolled). */
  onSelectedIdChange?: (id: string | null) => void;
  /** Controlled selected tab id. `null` means no panel is open. */
  selectedId?: string | null;
  /** Bounce of the shared spring. 0 is a smooth ease, higher values overshoot more. @default 0 */
  springBounce?: number;
  /** Duration of the shared spring driving the shell, pill, tab, and content transitions. @default 0.45 */
  springDuration?: number;
  tabs: ExpandableTab[];
  /** Vertical scale applied to a tab while pressed, for tactile press feedback. @default 0.8 */
  tapScale?: number;
}

const contentVariants = {
  initial: (direction: number) => ({ x: `${60 * direction}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (direction: number) => ({ x: `${-60 * direction}%`, opacity: 0 }),
};

/** Shared padding/gap for a trigger button, used by both the ghost
 * measurement row and the real interactive row so they can't drift apart. */
function triggerBoxStyle(isActive: boolean) {
  return {
    gap: isActive ? ".5rem" : 0,
    paddingLeft: isActive ? "1rem" : ".5rem",
    paddingRight: isActive ? "1rem" : ".5rem",
  };
}

export function ExpandableTabs({
  tabs,
  selectedId: controlledSelectedId,
  defaultSelectedId = null,
  onSelectedIdChange,
  springDuration = 0.45,
  springBounce = 0,
  labelDelay = 0.08,
  maxContentWidth = "24rem",
  tapScale = 0.8,
  className,
  classNames,
}: ExpandableTabsProps) {
  const idPrefix = useId();
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    defaultSelectedId
  );
  const [direction, setDirection] = useState(1);
  const [lastContentHeight, setLastContentHeight] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const isControlled = controlledSelectedId !== undefined;
  const selected = isControlled ? controlledSelectedId : internalSelectedId;

  const setSelected = useCallback(
    (id: string | null) => {
      if (!isControlled) {
        setInternalSelectedId(id);
      }
      onSelectedIdChange?.(id);
    },
    [isControlled, onSelectedIdChange]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [rowRef, rowBounds] = useMeasure();
  const [measureRef, bounds] = useMeasure();

  const activeIndex = tabs.findIndex((tab) => tab.id === selected);
  const activeTab = activeIndex === -1 ? null : tabs[activeIndex];
  const barHeight = rowBounds.height || 52;

  const spring = useMemo<Transition>(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : { duration: springDuration, type: "spring", bounce: springBounce },
    [prefersReducedMotion, springDuration, springBounce]
  );

  // Content opacity fades faster than the shell/box shrink so it's already
  // near-invisible before the narrowing pill would otherwise clip it —
  // avoids a hard edge cutting through still-legible text on close.
  const contentTransition = useMemo<Transition>(
    () => ({
      ...spring,
      opacity: { duration: prefersReducedMotion ? 0 : 0.15 },
    }),
    [spring, prefersReducedMotion]
  );

  // Label width always moves in lockstep with the button's own gap/padding
  // (no delay, same on reveal and hide) so the row's footprint never lags
  // behind the pill. `labelDelay` only staggers the label's own fade —
  // purely cosmetic, applied evenly on both reveal and hide.
  const labelTransition = useMemo<Transition>(
    () => ({
      ...spring,
      opacity: { ...spring, delay: labelDelay },
    }),
    [spring, labelDelay]
  );

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (
        selected !== null &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSelected(null);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [selected, setSelected]);

  useEffect(() => {
    if (selected === null) {
      return;
    }

    const openIndex = activeIndex;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
        triggerRefs.current[openIndex]?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selected, activeIndex, setSelected]);

  useEffect(() => {
    if (bounds.height > 0) {
      setLastContentHeight(bounds.height);
    }
  }, [bounds.height]);
  const contentHeight = bounds.height > 0 ? bounds.height : lastContentHeight;

  function handleTabClick(tab: ExpandableTab, index: number) {
    if (selected === null) {
      // Opening from closed: fade in place, no lateral tab to slide from.
      setDirection(0);
      setSelected(tab.id);
    } else if (selected === tab.id) {
      // Closing: fade out in place, don't slide toward a stale direction.
      setDirection(0);
      setSelected(null);
    } else {
      setDirection(index > activeIndex ? 1 : -1);
      setSelected(tab.id);
    }
  }

  return (
    <div className={cn(classNames?.root, className)} ref={containerRef}>
      <LayoutGroup>
        <motion.div
          animate={{
            height: selected === null ? barHeight : contentHeight + barHeight,
            width:
              selected === null
                ? rowBounds.width
                : Math.max(rowBounds.width, bounds.width),
          }}
          className={cn(
            "relative overflow-hidden rounded-3xl bg-background",
            classNames?.toolbar
          )}
          initial={false}
          transition={spring}
        >
          {/* No `mode="popLayout"`: it snapshots the exiting child's
              position in absolute pixels, which fights the live
              `left-1/2 -translate-x-1/2` recentering below as the pill keeps
              shrinking. Each content instance (entering AND exiting) is its
              own `position:absolute` element instead of a shared normal-flow
              wrapper — otherwise, while switching tabs, the exiting and
              entering copies would briefly coexist in normal flow and stack
              vertically, inflating the measured height. Only the current
              (entering) instance carries `ref={measureRef}`, since the
              exiting clone is a separate Motion-managed instance. */}
          <AnimatePresence custom={direction} initial={false}>
            {selected !== null && activeTab && (
              <motion.div
                animate="active"
                aria-labelledby={`${idPrefix}-trigger-${activeTab.id}`}
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 bg-background/80 p-4 pb-4",
                  classNames?.content
                )}
                custom={direction}
                exit="exit"
                id={`${idPrefix}-panel-${activeTab.id}`}
                initial="initial"
                key={activeTab.id}
                ref={measureRef}
                role="region"
                style={{ maxWidth: maxContentWidth }}
                transition={contentTransition}
                variants={contentVariants}
              >
                {activeTab.content}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ghost row: mirrors the current (settled) row size for measurement
              only, so useMeasure never chases the visible label's own
              width-reveal animation — it reads the final target size
              immediately instead of frame-by-frame. */}
          <div
            aria-hidden="true"
            className="invisible absolute bottom-0 left-1/2 -translate-x-1/2 bg-background p-2"
            ref={rowRef}
          >
            <div className="flex h-9 items-center gap-1">
              {tabs.map((tab) => {
                const isActive = selected === tab.id;
                return (
                  <div
                    className="flex h-full items-center rounded-2xl font-medium text-sm"
                    key={tab.id}
                    style={triggerBoxStyle(isActive)}
                  >
                    <tab.icon className={cn("size-4", tab.iconClassName)} />
                    {isActive && (
                      <span className="whitespace-nowrap font-medium tracking-tight">
                        {tab.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-background p-2">
            <div className="flex h-9 items-center gap-1">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = selected === tab.id;
                const triggerId = `${idPrefix}-trigger-${tab.id}`;
                const panelId = `${idPrefix}-panel-${tab.id}`;

                return (
                  <motion.button
                    animate={triggerBoxStyle(isActive)}
                    aria-controls={panelId}
                    aria-expanded={isActive}
                    className={cn(
                      "flex h-full cursor-pointer items-center rounded-2xl font-medium text-sm transition-colors duration-300",
                      isActive
                        ? cn("bg-foreground/4", classNames?.triggerActive)
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      classNames?.trigger
                    )}
                    id={triggerId}
                    initial={false}
                    key={tab.id}
                    onClick={() => handleTabClick(tab, index)}
                    ref={(node) => {
                      triggerRefs.current[index] = node;
                    }}
                    transition={spring}
                    type="button"
                    whileTap={{
                      scaleY: prefersReducedMotion ? 1 : tapScale,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <Icon className={cn("size-4", tab.iconClassName)} />
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          animate={{ width: "auto", opacity: 1 }}
                          className={cn(
                            "overflow-hidden whitespace-nowrap font-medium tracking-tight",
                            classNames?.label
                          )}
                          exit={{
                            width: 0,
                            opacity: 0,
                            transition: labelTransition,
                          }}
                          initial={{ width: 0, opacity: 0 }}
                          transition={labelTransition}
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
