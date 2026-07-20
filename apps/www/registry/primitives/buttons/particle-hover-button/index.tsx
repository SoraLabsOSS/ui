/** biome-ignore-all lint/suspicious/noArrayIndexKey: fixed-size particle pool, never reordered/resized. */
"use client";

import { cn } from "@workspace/ui/lib/utils";
import { animate } from "motion";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  type RefCallback,
  useEffect,
  useRef,
} from "react";
import { usePrefersReducedMotion } from "@/registry/hooks/use-prefers-reduced-motion";

const DEFAULT_PARTICLE = (
  <span className="block h-1.5 w-1.5 rounded-full bg-current" />
);

const PARTICLE_CLASS =
  "-translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 opacity-0 [filter:drop-shadow(0_0_3px_currentColor)] [mix-blend-mode:plus-lighter]";

export interface ParticleHoverButtonClassNames {
  /** The wrapper around `children` that pulses on hover. */
  content?: string;
  /** Each cloned particle node. */
  particle?: string;
}

export interface ParticleHoverButtonProps {
  /** The interactive element (or plain label) this wraps — its own attributes/behavior are untouched. */
  children: ReactNode;
  className?: string;
  /** Per-slot class overrides: `content`, `particle`. */
  classNames?: ParticleHoverButtonClassNames;
  /**
   * Particle lifetime, in milliseconds.
   * @default 1200
   */
  duration?: number;
  /**
   * Milliseconds between each particle emission while hovering.
   * @default 100
   */
  interval?: number;
  /** The node cloned for each emitted particle. @default a small filled dot */
  particle?: ReactNode;
  /**
   * Number of pooled particle nodes reused across emissions — caps how
   * many can be on screen at once, regardless of how long the pointer
   * lingers.
   * @default 24
   */
  poolSize?: number;
  ref?: Ref<HTMLSpanElement>;
  /**
   * Horizontal drift jitter per particle, in pixels.
   * @default 16
   */
  spread?: number;
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ParticleHoverButton({
  children,
  className,
  classNames,
  duration = 1200,
  interval = 100,
  particle = DEFAULT_PARTICLE,
  poolSize = 24,
  ref,
  spread = 16,
}: ParticleHoverButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const rootRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inUseRef = useRef<boolean[]>([]);
  const pointerRef = useRef({ x: 0, y: 0 });
  const emitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseControlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const activeParticleAnimationsRef = useRef<Set<ReturnType<typeof animate>>>(
    new Set()
  );

  useEffect(
    () => () => {
      if (emitIntervalRef.current !== null) {
        clearInterval(emitIntervalRef.current);
      }
      pulseControlsRef.current?.stop();
      for (const controls of activeParticleAnimationsRef.current) {
        controls.stop();
      }
      activeParticleAnimationsRef.current.clear();
    },
    []
  );

  const updatePointer = (e: ReactPointerEvent<HTMLSpanElement>) => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const rect = root.getBoundingClientRect();
    pointerRef.current = {
      x: clamp(e.clientX - rect.left, 0, rect.width),
      y: clamp(e.clientY - rect.top, 0, rect.height),
    };
  };

  const emitParticle = () => {
    const index = inUseRef.current.findIndex((inUse) => !inUse);
    if (index === -1) {
      return;
    }
    const el = particleRefs.current[index];
    if (!el) {
      return;
    }

    inUseRef.current[index] = true;
    el.style.left = `${pointerRef.current.x}px`;
    el.style.top = `${pointerRef.current.y}px`;

    const jitterA = (Math.random() * 2 - 1) * spread;
    const jitterB = (Math.random() * 2 - 1) * spread;
    const drift = 30 + Math.random() * 20;

    const controls = animate(
      el,
      {
        opacity: [0, 1, 1, 0],
        scale: [0, 0.85, 0],
        x: [0, jitterA, jitterB],
        y: [0, -drift],
      },
      { duration: duration / 1000, ease: "easeOut" }
    );
    activeParticleAnimationsRef.current.add(controls);
    controls.then(() => {
      inUseRef.current[index] = false;
      activeParticleAnimationsRef.current.delete(controls);
    });
  };

  const handlePointerEnter = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (prefersReducedMotion) {
      return;
    }
    updatePointer(e);
    if (emitIntervalRef.current === null) {
      emitIntervalRef.current = setInterval(emitParticle, interval);
    }
    pulseControlsRef.current?.stop();
    if (contentRef.current) {
      pulseControlsRef.current = animate(
        contentRef.current,
        { scale: [1, 1.04, 1] },
        { duration: 0.9, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
      );
    }
  };

  const handlePointerLeave = () => {
    if (emitIntervalRef.current !== null) {
      clearInterval(emitIntervalRef.current);
      emitIntervalRef.current = null;
    }
    pulseControlsRef.current?.stop();
    if (contentRef.current) {
      pulseControlsRef.current = animate(
        contentRef.current,
        { scale: 1 },
        { duration: 0.3 }
      );
    }
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={updatePointer}
      ref={mergeRefs(rootRef, ref)}
    >
      <span
        className={cn("relative z-[1] inline-flex", classNames?.content)}
        ref={contentRef}
      >
        {children}
      </span>
      {prefersReducedMotion ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {Array.from({ length: poolSize }, (_, index) => (
            <span
              className={cn(PARTICLE_CLASS, classNames?.particle)}
              key={index}
              ref={(el) => {
                particleRefs.current[index] = el;
                inUseRef.current[index] ??= false;
              }}
            >
              {particle}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
