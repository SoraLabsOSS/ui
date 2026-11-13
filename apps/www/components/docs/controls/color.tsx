"use client";

import { ColorControl } from "dialkit";
import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";

import { lockScroll, unlockScroll } from "./scroll-lock";

export type ControlColorProps = ComponentProps<typeof ColorControl> & {
  className?: string;
};

export const ControlColor = ({ className, ...props }: ControlColorProps) => {
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
      const row = el.querySelector(
        ".dialkit-color-control"
      ) as HTMLElement | null;
      const isOpen =
        row?.dataset.open === "true" ||
        row
          ?.querySelector(".dialkit-color-swatch")
          ?.getAttribute("aria-expanded") === "true";

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
      <ColorControl {...props} />
    </div>
  );
};
