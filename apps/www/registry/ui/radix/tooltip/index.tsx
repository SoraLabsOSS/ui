"use client";

import { useControlledState } from "@workspace/ui/hooks/use-controlled-state";
import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { Direction, Tooltip as TooltipPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

type TooltipSide =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "inline-start"
  | "inline-end";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  setSide: (side: TooltipSide) => void;
  side: TooltipSide;
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

interface TooltipProviderProps
  extends ComponentProps<typeof TooltipPrimitive.Provider> {
  /**
   * Delay in milliseconds before showing tooltips.
   * Alias to delayDuration.
   * @default 0
   */
  delay?: number;
}

/**
 * Provides shared delay and grouping settings for tooltips.
 */
function TooltipProvider({
  delay = 0,
  delayDuration,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration ?? delay}
      {...props}
    />
  );
}

type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root>;

/**
 * Root container for the Tooltip component powered by Radix UI and Motion.
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
    onChange: onOpenChange,
    value: controlledOpen,
  });
  const [side, setSide] = useState<TooltipSide>("top");

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
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        {...props}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipContext.Provider>
  );
}

type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger>;

/**
 * Interactive element that activates the tooltip on hover or keyboard focus.
 */
function TooltipTrigger({ asChild = false, ...props }: TooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger
      asChild={asChild}
      data-slot="tooltip-trigger"
      {...props}
    />
  );
}

interface TooltipContentProps
  extends Omit<ComponentProps<typeof TooltipPrimitive.Content>, "side"> {
  /**
   * Floating side position relative to trigger.
   * Supports logical inline-start and inline-end for native RTL.
   * @default "top"
   */
  side?: TooltipSide;
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
  asChild,
  style,
  transition = defaultSpringTransition,
  ...props
}: TooltipContentProps) {
  const context = useTooltipContext();
  const direction = Direction.useDirection();
  const shouldReduceMotion = useReducedMotion();
  const isOpen = context?.open ?? true;

  if (context && context.side !== side) {
    context.setSide(side);
  }

  const resolvedSide = useMemo(() => {
    if (side === "inline-start") {
      return direction === "rtl" ? "right" : "left";
    }
    if (side === "inline-end") {
      return direction === "rtl" ? "left" : "right";
    }
    return side;
  }, [side, direction]);

  const offset = useMemo(() => {
    switch (resolvedSide) {
      case "bottom":
        return { x: 0, y: -8 };
      case "left":
        return { x: 8, y: 0 };
      case "right":
        return { x: -8, y: 0 };
      default:
        return { x: 0, y: 8 };
    }
  }, [resolvedSide]);

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
        <TooltipPrimitive.Portal forceMount>
          <TooltipPrimitive.Content
            align={align}
            alignOffset={alignOffset}
            asChild
            className={cn(
              "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-background text-xs shadow-md outline-none has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
              className
            )}
            data-slot="tooltip-content"
            forceMount
            side={resolvedSide}
            sideOffset={sideOffset}
            {...props}
          >
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
                transformOrigin:
                  "var(--radix-tooltip-content-transform-origin, var(--transform-origin))",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "subpixel-antialiased",
                ...style,
              }}
              transition={shouldReduceMotion ? { duration: 0.1 } : transition}
            >
              {children}
            </motion.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type TooltipArrowProps = ComponentProps<typeof TooltipPrimitive.Arrow>;

/**
 * Optional arrow pointing towards the tooltip trigger.
 */
function TooltipArrow({ className, ...props }: TooltipArrowProps) {
  return (
    <TooltipPrimitive.Arrow
      className={cn("z-50 fill-foreground", className)}
      data-slot="tooltip-arrow"
      {...props}
    />
  );
}

const DirectionProvider = Direction.DirectionProvider;

export type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipProps,
  TooltipProviderProps,
  TooltipSide,
  TooltipTriggerProps,
};
export {
  DirectionProvider,
  defaultSpringTransition,
  Tooltip,
  Tooltip as RadixTooltip,
  Tooltip as default,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useTooltipContext,
};
