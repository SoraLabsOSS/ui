"use client";

import type * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

interface AutoHeightOptions {
  includeParentBox?: boolean;
  includeSelfBox?: boolean;
}

function getBoxExtra(element: HTMLElement): number {
  const style = getComputedStyle(element);
  if (style.boxSizing !== "border-box") {
    return 0;
  }

  const padding =
    (Number.parseFloat(style.paddingTop || "0") || 0) +
    (Number.parseFloat(style.paddingBottom || "0") || 0);
  const border =
    (Number.parseFloat(style.borderTopWidth || "0") || 0) +
    (Number.parseFloat(style.borderBottomWidth || "0") || 0);

  return padding + border;
}

export function useAutoHeight<T extends HTMLElement = HTMLDivElement>(
  deps: React.DependencyList = [],
  options: AutoHeightOptions = {
    includeParentBox: true,
    includeSelfBox: false,
  }
) {
  const ref = useRef<T | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const [height, setHeight] = useState(0);

  const scheduleHeight = useCallback((next: number) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setHeight(next);
    });
  }, []);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return 0;
    }

    const base = Math.max(
      el.getBoundingClientRect().height || 0,
      el.scrollHeight || 0
    );

    let extra = 0;

    if (options.includeParentBox && el.parentElement) {
      extra += getBoxExtra(el.parentElement);
    }

    if (options.includeSelfBox) {
      extra += getBoxExtra(el);
    }

    const dpr =
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    const total = Math.ceil((base + extra) * dpr) / dpr;

    return total;
  }, [options.includeParentBox, options.includeSelfBox]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    setHeight(measure());

    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }

    const ro = new ResizeObserver(() => {
      scheduleHeight(measure());
    });

    ro.observe(el);
    if (options.includeParentBox && el.parentElement) {
      ro.observe(el.parentElement);
    }

    roRef.current = ro;

    return () => {
      ro.disconnect();
      roRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: Caller-controlled deps trigger remeasurement for content changes; ResizeObserver tracks size changes.
  }, deps);

  useLayoutEffect(() => {
    if (height === 0) {
      const next = measure();
      if (next !== 0) {
        setHeight(next);
      }
    }
  }, [height, measure]);

  return { ref, height } as const;
}
