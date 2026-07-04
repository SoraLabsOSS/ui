"use client";

// beui.dev/components/motion/bottom-sheet

import { EASE_DRAWER } from "@workspace/ui/lib/ease";
import { cn } from "@workspace/ui/lib/utils";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Vaul-style glide: a long, fully-damped tween reads smoother than a spring on
// open — no settle/overshoot, just one clean decel. Same curve drives the
// backdrop fade so the surface and scrim move as one.
const DRAWER = { duration: 0.5, ease: EASE_DRAWER } as const;

export interface BottomSheetProps {
  children?: ReactNode;
  className?: string;
  defaultSnap?: number;
  description?: string;
  /** Min drag distance (px) past current snap to dismiss. */
  dismissThreshold?: number;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  /** Heights (0-1 = fraction of viewport, or "auto"). First entry is default. */
  snapPoints?: (number | "auto")[];
  title?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  snapPoints = [0.5, 0.92],
  defaultSnap = 0,
  title,
  description,
  children,
  className,
  dismissThreshold = 120,
}: BottomSheetProps) {
  const [snap, setSnap] = useState(defaultSnap);
  const [mounted, setMounted] = useState(false);
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const heightRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Strong downward fling or large drag → dismiss.
    if (velocity > 600 || offset > dismissThreshold) {
      const smaller = snapPoints.map((_, i) => i).filter((i) => i < snap);
      if (smaller.length && velocity < 800 && offset < dismissThreshold * 1.6) {
        setSnap(smaller[smaller.length - 1]);
      } else {
        onOpenChange(false);
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
  };

  const snapValue = snapPoints[snap];
  const heightStyle =
    snapValue === "auto"
      ? { maxHeight: "92vh" }
      : { height: `${snapValue * 100}vh` };

  // Portal to <body>: an ancestor with backdrop-filter or transform becomes
  // the containing block for fixed descendants, which would position the
  // sheet against that ancestor instead of the viewport.
  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="pointer-events-none fixed inset-0 z-50">
          <motion.div
            animate={{ opacity: 1 }}
            // A dim scrim with a light blur. backdrop-blur is GPU-expensive and
            // re-rasterizes every frame the sheet drags over it; a small radius
            // plus more opacity keeps the glass look without the jank.
            className="pointer-events-auto absolute inset-0 bg-background/40 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            transition={DRAWER}
          />
          <motion.div
            animate={reduce ? { y: 0, opacity: 1 } : { y: 0 }}
            aria-label={title}
            aria-modal="true"
            className={cn(
              "pointer-events-auto absolute right-0 bottom-0 left-0 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-t-3xl will-change-transform",
              "border border-border bg-card shadow-xl",
              className
            )}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragControls={dragControls}
            dragElastic={{ top: 0.02, bottom: 0.4 }}
            dragListener={false}
            dragMomentum={false}
            exit={reduce ? { y: 0, opacity: 0 } : { y: "100%" }}
            initial={reduce ? { y: 0, opacity: 0 } : { y: "100%" }}
            onAnimationComplete={() => {
              if (sheetRef.current) {
                heightRef.current = sheetRef.current.offsetHeight;
              }
            }}
            onDragEnd={onDragEnd}
            ref={sheetRef}
            role="dialog"
            style={heightStyle}
            transition={reduce ? { duration: 0.18, ease: EASE_DRAWER } : DRAWER}
          >
            <div
              className="flex cursor-grab touch-none flex-col items-center px-4 pt-3 pb-2 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
              {title || description ? (
                <div className="mt-3 w-full">
                  {title ? (
                    <h2 className="font-semibold text-base text-foreground">
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p className="mt-0.5 text-muted-foreground text-sm">
                      {description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            {/* overscroll-contain stops boundary scrolls from chaining to the page. */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
