/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions -- The target wraps its own interactive child; the span only needs hover affordances. */
/* oxlint-disable jsx-a11y/no-static-element-interactions -- Same as above — hover-only, no keyboard/click semantics of its own. */

"use client";

import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";
import { gsap } from "gsap";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

const DEFAULT_LABEL = "click";
const CURSOR_OFFSET_X = 13;
const CURSOR_OFFSET_Y = -43;
const FOLLOW_DURATION = 0.5;
const POP_IN_DURATION = 1.7;
const POP_IN_DELAY = 0.1;
const POP_OUT_DURATION = 0.3;
const RESTING_ROTATION = -30;

interface CursorBubbleContextValue {
  hide: () => void;
  show: (label: string) => void;
}

const CursorBubbleContext = createContext<CursorBubbleContextValue | null>(
  null
);

function useCursorBubbleContext() {
  const context = useContext(CursorBubbleContext);

  if (!context) {
    throw new Error(
      "CursorBubbleTarget must be used within a CursorBubble provider."
    );
  }

  return context;
}

function useCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const update = () => {
      setIsCoarsePointer(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isCoarsePointer;
}

export interface CursorBubbleProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  /** Extra classes applied to the floating bubble itself (color, padding, shape, etc). */
  bubbleClassName?: string;
  children?: ReactNode;
}

function CursorBubble({
  bubbleClassName,
  children,
  className,
  ...props
}: CursorBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<(label: string) => void>(() => {});
  const hideRef = useRef<() => void>(() => {});
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const disabled = prefersReducedMotion || isCoarsePointer;

  useGSAP(
    () => {
      const bubble = bubbleRef.current;
      if (!bubble || disabled) {
        return;
      }

      const xTo = gsap.quickTo(bubble, "x", {
        duration: FOLLOW_DURATION,
        ease: "power3",
      });
      const yTo = gsap.quickTo(bubble, "y", {
        duration: FOLLOW_DURATION,
        ease: "power3",
      });

      gsap.set(bubble, { rotation: RESTING_ROTATION });

      showRef.current = (label: string) => {
        bubble.textContent = label;
        gsap.killTweensOf(bubble, "opacity,scale,rotation");
        gsap.to(bubble, {
          duration: POP_IN_DURATION,
          delay: POP_IN_DELAY,
          ease: "elastic.out(1, 0.4)",
          opacity: 1,
          rotation: 0,
          scale: 1,
        });
      };

      hideRef.current = () => {
        gsap.killTweensOf(bubble, "opacity,scale,rotation");
        gsap.to(bubble, {
          duration: POP_OUT_DURATION,
          ease: "sine.inOut",
          opacity: 1,
          rotation: RESTING_ROTATION,
          scale: 0,
        });
      };

      const handlePointerMove = (event: PointerEvent) => {
        xTo(event.clientX + CURSOR_OFFSET_X);
        yTo(event.clientY + CURSOR_OFFSET_Y);
      };

      window.addEventListener("pointermove", handlePointerMove);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        showRef.current = () => {};
        hideRef.current = () => {};
      };
    },
    { dependencies: [disabled] }
  );

  const contextValue = useMemo<CursorBubbleContextValue>(
    () => ({
      hide: () => hideRef.current(),
      show: (label: string) => showRef.current(label),
    }),
    []
  );

  return (
    <CursorBubbleContext.Provider value={contextValue}>
      <div className={cn("contents", className)} {...props}>
        {children}
        {disabled ? null : (
          <div
            aria-hidden="true"
            className={cn(
              "bg-primary text-primary-foreground pointer-events-none fixed top-0 left-0 z-100 origin-left scale-0 rounded-[50px_50px_50px_0] px-[7px] py-[5px] text-lg font-medium whitespace-nowrap capitalize opacity-0",
              bubbleClassName
            )}
            ref={bubbleRef}
          />
        )}
      </div>
    </CursorBubbleContext.Provider>
  );
}

export interface CursorBubbleTargetProps extends Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> {
  children?: ReactNode;
  /** Text shown in the bubble while hovering this target. @default "click" */
  label?: string;
}

function CursorBubbleTarget({
  children,
  label = DEFAULT_LABEL,
  ...props
}: CursorBubbleTargetProps) {
  const { hide, show } = useCursorBubbleContext();

  return (
    <span onMouseEnter={() => show(label)} onMouseLeave={hide} {...props}>
      {children}
    </span>
  );
}

export { CursorBubble, CursorBubbleTarget };
