"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { createContext, useContext, useMemo, useState } from "react";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  setSide: (side: TooltipPrimitive.Positioner.Props["side"]) => void;
  side: TooltipPrimitive.Positioner.Props["side"];
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  return useContext(TooltipContext);
}

const defaultSpringTransition: Transition = {
  visualDuration: 0.3,
  type: "spring",
  bounce: 0.6,
};

type TooltipProviderProps = TooltipPrimitive.Provider.Props;

/**
 * Provides shared delay and grouping settings for tooltips.
 */
function TooltipProvider({ delay = 0, ...props }: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  );
}

type TooltipProps = TooltipPrimitive.Root.Props;

/**
 * Root container for the Tooltip component powered by Base UI and Motion.
 */
function Tooltip({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useControlledState({
    defaultValue: defaultOpen,
    onChange: (nextOpen: boolean) => {
      onOpenChange?.(
        nextOpen,
        undefined as unknown as TooltipPrimitive.Root.ChangeEventDetails
      );
    },
    value: controlledOpen,
  });
  const [side, setSide] =
    useState<TooltipPrimitive.Positioner.Props["side"]>("top");

  const contextValue = useMemo(
    () => ({
      open: Boolean(open),
      setOpen,
      side,
      setSide,
    }),
    [open, setOpen, side]
  );

  return (
    <TooltipContext.Provider value={contextValue}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        onOpenChange={(nextOpen, eventDetails) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen, eventDetails);
        }}
        open={open}
        {...props}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipContext.Provider>
  );
}

type TooltipTriggerProps = TooltipPrimitive.Trigger.Props;

/**
 * Interactive element that activates the tooltip on hover or keyboard focus.
 */
function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

interface TooltipContentProps
  extends TooltipPrimitive.Popup.Props,
    Pick<
      TooltipPrimitive.Positioner.Props,
      "align" | "alignOffset" | "side" | "sideOffset"
    > {
  /**
   * Custom spring transition config for the entrance and exit animation.
   * @default { visualDuration: 0.3, type: "spring", bounce: 0.6 }
   */
  transition?: Transition;
}

/**
 * The floating popup content container animated via Motion spring physics.
 */
function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  render,
  style,
  transition = defaultSpringTransition,
  ...props
}: TooltipContentProps) {
  const context = useTooltipContext();
  const shouldReduceMotion = useReducedMotion();
  const isOpen = context?.open ?? true;

  if (context && context.side !== side) {
    context.setSide(side);
  }

  const offset = useMemo(() => {
    switch (side) {
      case "bottom":
        return { x: 0, y: -8 };
      case "left":
      case "inline-start":
        return { x: 8, y: 0 };
      case "right":
      case "inline-end":
        return { x: -8, y: 0 };
      default:
        return { x: 0, y: 8 };
    }
  }, [side]);

  const initialMotion = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.8, x: offset.x, y: offset.y };

  const animateMotion = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, x: 0, y: 0 };

  const exitMotion = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.8, x: offset.x, y: offset.y };

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipPrimitive.Portal keepMounted>
          <TooltipPrimitive.Positioner
            align={align}
            alignOffset={alignOffset}
            className="isolate z-50"
            side={side}
            sideOffset={sideOffset}
          >
            <TooltipPrimitive.Popup
              className={cn(
                "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-background text-xs shadow-md outline-none has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
                className
              )}
              data-slot="tooltip-content"
              render={
                render ?? (
                  <motion.div
                    animate={animateMotion}
                    exit={{
                      ...exitMotion,
                      transition: shouldReduceMotion
                        ? { duration: 0.1 }
                        : { duration: 0.15, ease: "easeIn" },
                    }}
                    initial={initialMotion}
                    style={{
                      transformOrigin: "var(--transform-origin)",
                      willChange: "transform, opacity",
                      backfaceVisibility: "hidden",
                      WebkitFontSmoothing: "subpixel-antialiased",
                      ...style,
                    }}
                    transition={
                      shouldReduceMotion ? { duration: 0.1 } : transition
                    }
                  />
                )
              }
              {...props}
            >
              {children}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type TooltipArrowProps = TooltipPrimitive.Arrow.Props;

/**
 * Optional arrow pointing towards the tooltip trigger.
 */
function TooltipArrow({ className, ...props }: TooltipArrowProps) {
  return (
    <TooltipPrimitive.Arrow
      className={cn(
        "z-50 size-2.5 rotate-45 rounded-[2px] bg-foreground fill-foreground",
        "data-[side=bottom]:top-[-5px]",
        "data-[side=top]:bottom-[-5px]",
        "data-[side=right]:left-[-5px]",
        "data-[side=left]:right-[-5px]",
        "data-[side=inline-end]:left-[-5px]",
        "data-[side=inline-start]:right-[-5px]",
        className
      )}
      data-slot="tooltip-arrow"
      {...props}
    />
  );
}

export type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipProps,
  TooltipProviderProps,
  TooltipTriggerProps,
};
export {
  defaultSpringTransition,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};
