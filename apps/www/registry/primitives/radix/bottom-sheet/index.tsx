"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type PanInfo,
  useDragControls,
} from "motion/react";
import { Dialog as SheetPrimitive } from "radix-ui";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useControlledState } from "@/registry/hooks/use-controlled-state";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";
import { EASE_DRAWER } from "@/registry/lib/ease";
import { getStrictContext } from "@/registry/lib/get-strict-context";

// Vaul-style glide: a long, fully-damped tween reads smoother than a spring on
// open — no settle/overshoot, just one clean decel. Same curve drives the
// backdrop fade so the surface and scrim move as one.
const DRAWER_TRANSITION = { duration: 0.5, ease: EASE_DRAWER } as const;

interface BottomSheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const [BottomSheetProvider, useBottomSheet] =
  getStrictContext<BottomSheetContextType>("BottomSheetContext");

type BottomSheetProps = ComponentProps<typeof SheetPrimitive.Root>;

function BottomSheet({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: BottomSheetProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  return (
    <BottomSheetProvider value={{ open: isOpen, setOpen: setIsOpen }}>
      <SheetPrimitive.Root
        data-slot="bottom-sheet"
        onOpenChange={setIsOpen}
        open={isOpen}
        {...props}
      />
    </BottomSheetProvider>
  );
}

type BottomSheetTriggerProps = ComponentProps<typeof SheetPrimitive.Trigger>;

function BottomSheetTrigger(props: BottomSheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="bottom-sheet-trigger" {...props} />;
}

type BottomSheetCloseProps = ComponentProps<typeof SheetPrimitive.Close>;

function BottomSheetClose(props: BottomSheetCloseProps) {
  return <SheetPrimitive.Close data-slot="bottom-sheet-close" {...props} />;
}

type BottomSheetOverlayProps = HTMLMotionProps<"div">;

function BottomSheetOverlay({ className, ...props }: BottomSheetOverlayProps) {
  return (
    <SheetPrimitive.Overlay asChild forceMount>
      <motion.div
        animate={{ opacity: 1 }}
        className={cn(
          "fixed inset-0 z-50 bg-background/40 backdrop-blur-sm",
          className
        )}
        data-slot="bottom-sheet-overlay"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={DRAWER_TRANSITION}
        {...props}
      />
    </SheetPrimitive.Overlay>
  );
}

interface BottomSheetContentProps
  extends Omit<
    ComponentProps<typeof SheetPrimitive.Content>,
    "asChild" | "forceMount" | "children" | keyof HTMLMotionProps<"div">
  > {
  children?: ReactNode;
  className?: string;
  defaultSnap?: number;
  /** Min drag distance (px) past the current snap point before it dismisses. */
  dismissThreshold?: number;
  handleClassName?: string;
  /** Renders the dimmed, blurred scrim behind the sheet. */
  overlay?: boolean;
  overlayClassName?: string;
  /** Renders the draggable grab handle above `children`. */
  showHandle?: boolean;
  /** Heights (0-1 = fraction of viewport, or "auto"). First entry is the default. */
  snapPoints?: (number | "auto")[];
  style?: HTMLMotionProps<"div">["style"];
}

function BottomSheetContent({
  className,
  children,
  snapPoints = [0.5, 0.92],
  defaultSnap = 0,
  dismissThreshold = 120,
  overlay = true,
  overlayClassName,
  showHandle = true,
  handleClassName,
  style,
  ...props
}: BottomSheetContentProps) {
  const { open, setOpen } = useBottomSheet();
  const [snap, setSnap] = useState(defaultSnap);
  const dragControls = useDragControls();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (open) {
      setSnap(defaultSnap);
    }
  }, [open, defaultSnap]);

  // Lock background scroll while open. overflow:hidden alone is ignored by
  // iOS Safari — boundary scrolls inside the sheet chain to the page, which
  // scrolls underneath and ends up somewhere else on close. position:fixed
  // is the lock that actually holds; restore the scroll position after.
  useEffect(() => {
    if (!open) {
      return;
    }
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // Strong downward fling or large drag → dismiss (or drop one snap).
      if (velocity > 600 || offset > dismissThreshold) {
        const smaller = snapPoints.map((_, i) => i).filter((i) => i < snap);
        if (
          smaller.length &&
          velocity < 800 &&
          offset < dismissThreshold * 1.6
        ) {
          setSnap(smaller.at(-1) as number);
        } else {
          setOpen(false);
        }
        return;
      }

      // Strong upward fling → next snap.
      if (velocity < -500) {
        setSnap(Math.min(snapPoints.length - 1, snap + 1));
        return;
      }

      // Otherwise snap to nearest by current offset.
      if (offset > 80 && snap > 0) {
        setSnap(snap - 1);
      } else if (offset < -80 && snap < snapPoints.length - 1) {
        setSnap(snap + 1);
      }
    },
    [dismissThreshold, setOpen, snap, snapPoints]
  );

  const snapValue = snapPoints[snap];
  const heightStyle =
    snapValue === "auto"
      ? { maxHeight: "92vh" }
      : { height: `${(snapValue ?? 1) * 100}vh` };

  return (
    <AnimatePresence>
      {open ? (
        <SheetPrimitive.Portal forceMount>
          {overlay ? <BottomSheetOverlay className={overlayClassName} /> : null}
          <SheetPrimitive.Content asChild forceMount>
            <motion.div
              animate={reduceMotion ? { y: 0, opacity: 1 } : { y: 0 }}
              className={cn(
                "fixed inset-x-4 bottom-0 z-50 mx-auto flex max-w-md flex-col overflow-hidden rounded-2xl bg-transparent pb-4 outline-none will-change-transform md:mx-auto md:w-full",
                className
              )}
              data-slot="bottom-sheet-content"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragControls={dragControls}
              dragElastic={{ top: 0.02, bottom: 0.4 }}
              dragListener={false}
              dragMomentum={false}
              exit={reduceMotion ? { y: 0, opacity: 0 } : { y: "100%" }}
              initial={reduceMotion ? { y: 0, opacity: 0 } : { y: "100%" }}
              onDragEnd={onDragEnd}
              style={{ ...heightStyle, ...style }}
              transition={
                reduceMotion
                  ? { duration: 0.18, ease: EASE_DRAWER }
                  : DRAWER_TRANSITION
              }
              {...props}
            >
              {showHandle ? (
                <BottomSheetHandle
                  className={handleClassName}
                  dragControls={dragControls}
                />
              ) : null}
              {children}
            </motion.div>
          </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

interface BottomSheetHandleProps extends ComponentProps<"div"> {
  dragControls: ReturnType<typeof useDragControls>;
}

function BottomSheetHandle({
  className,
  dragControls,
  ...props
}: BottomSheetHandleProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 cursor-grab touch-none flex-col items-center px-4 pt-3 pb-2 active:cursor-grabbing",
        className
      )}
      data-slot="bottom-sheet-handle"
      onPointerDown={(event) => dragControls.start(event)}
      {...props}
    >
      <div className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
    </div>
  );
}

type BottomSheetTitleProps = ComponentProps<typeof SheetPrimitive.Title>;

function BottomSheetTitle({ className, ...props }: BottomSheetTitleProps) {
  return (
    <SheetPrimitive.Title
      className={cn("sr-only", className)}
      data-slot="bottom-sheet-title"
      {...props}
    />
  );
}

type BottomSheetDescriptionProps = ComponentProps<
  typeof SheetPrimitive.Description
>;

function BottomSheetDescription({
  className,
  ...props
}: BottomSheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      className={cn("sr-only", className)}
      data-slot="bottom-sheet-description"
      {...props}
    />
  );
}

type BottomSheetPanelProps = ComponentProps<"div">;

/** The rounded surface that sits inside `BottomSheetContent` — swap `bg-*` to restyle. */
function BottomSheetPanel({ className, ...props }: BottomSheetPanelProps) {
  return (
    <div
      className={cn(
        "relative z-[2] min-h-0 grow space-y-2 overflow-y-auto overscroll-contain rounded-2xl bg-muted p-2",
        className
      )}
      data-slot="bottom-sheet-panel"
      {...props}
    />
  );
}

type BottomSheetListProps = ComponentProps<"ul">;

function BottomSheetList({ className, ...props }: BottomSheetListProps) {
  return (
    <ul
      className={cn("grid w-full space-y-1.5 text-sm", className)}
      data-slot="bottom-sheet-list"
      {...props}
    />
  );
}

interface BottomSheetRowProps
  extends Omit<ComponentProps<"button">, "children" | "value"> {
  /** Overrides `label`/`value` entirely when you need a fully custom row layout. */
  children?: ReactNode;
  label: ReactNode;
  labelClassName?: string;
  lineClassName?: string;
  value?: ReactNode;
  valueClassName?: string;
}

/** One selectable row: `label ---- value`, with a hover surface and a bottom-edge reveal bar. */
function BottomSheetRow({
  className,
  label,
  value,
  children,
  labelClassName,
  valueClassName,
  lineClassName,
  type = "button",
  ...props
}: BottomSheetRowProps) {
  return (
    <li data-slot="bottom-sheet-row-item">
      <button
        className={cn(
          "relative w-full rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-accent",
          className
        )}
        data-slot="bottom-sheet-row"
        type={type}
        {...props}
      >
        {children ?? (
          <div className="flex flex-1 items-center justify-between gap-2 text-sm">
            <div
              className={cn(
                "flex items-center justify-center gap-2 font-medium uppercase tracking-wide",
                labelClassName
              )}
            >
              {label}
            </div>
            <span
              className={cn(
                "relative h-px flex-1 rounded-2xl bg-current/20",
                lineClassName
              )}
            />
            <span
              className={cn("font-sans text-foreground/50", valueClassName)}
            >
              {value}
            </span>
          </div>
        )}
      </button>
    </li>
  );
}

export {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  type BottomSheetContentProps,
  BottomSheetDescription,
  BottomSheetHandle,
  BottomSheetList,
  BottomSheetOverlay,
  BottomSheetPanel,
  type BottomSheetProps,
  BottomSheetRow,
  type BottomSheetRowProps,
  BottomSheetTitle,
  BottomSheetTrigger,
  useBottomSheet,
};
