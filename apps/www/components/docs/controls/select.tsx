"use client";

import { SelectControl } from "dialkit";
import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";

import { lockScroll, unlockScroll } from "./scroll-lock";

export type ControlSelectProps = ComponentProps<typeof SelectControl> & {
  className?: string;
};

export const ControlSelect = ({ className, ...props }: ControlSelectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    let isCurrentLocked = false;

    const handleLock = () => {
      if (!isCurrentLocked) {
        isCurrentLocked = true;
        lockScroll();
      }
    };

    const handleUnlock = () => {
      if (isCurrentLocked) {
        isCurrentLocked = false;
        unlockScroll();
      }
    };

    const checkOpenState = () => {
      const trigger = el.querySelector(
        ".dialkit-select-trigger"
      ) as HTMLElement | null;
      const isOpen =
        trigger?.dataset.open === "true" ||
        trigger?.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        handleLock();
      } else {
        handleUnlock();
      }
    };

    const observer = new MutationObserver(checkOpenState);

    observer.observe(el, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-open", "aria-expanded"],
    });

    return () => {
      observer.disconnect();
      handleUnlock();
    };
  }, []);

  return (
    <div className={className} ref={containerRef}>
      <SelectControl {...props} />
    </div>
  );
};
