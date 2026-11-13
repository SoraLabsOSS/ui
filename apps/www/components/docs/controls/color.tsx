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
    let repositionRaf: number | null = null;

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

    const positionPopover = () => {
      const popover = document.querySelector(
        ".dialkit-color-popover"
      ) as HTMLElement | null;
      const row = el.querySelector(
        ".dialkit-color-control"
      ) as HTMLElement | null;

      if (!popover || !row) {
        return;
      }

      const rowRect = row.getBoundingClientRect();
      const popoverWidth = popover.offsetWidth || 280;
      const popoverHeight = popover.offsetHeight || 370;
      const margin = 8;
      const gap = 6;

      // Base UI style: align popover right edge with the row right edge (anchored under swatch)
      let left = rowRect.right - popoverWidth;
      left = Math.max(
        margin,
        Math.min(left, window.innerWidth - popoverWidth - margin)
      );

      const spaceBelow = window.innerHeight - rowRect.bottom - gap - margin;
      const spaceAbove = rowRect.top - gap - margin;
      const isAbove = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

      let top = isAbove
        ? rowRect.top - popoverHeight - gap
        : rowRect.bottom + gap;
      top = Math.max(
        margin,
        Math.min(top, window.innerHeight - popoverHeight - margin)
      );

      const targetLeft = `${left}px`;
      const targetTop = `${top}px`;

      if (
        popover.style.getPropertyValue("left") !== targetLeft ||
        popover.style.getPropertyValue("top") !== targetTop
      ) {
        popover.style.setProperty("left", targetLeft, "important");
        popover.style.setProperty("top", targetTop, "important");
        popover.style.setProperty(
          "transform-origin",
          isAbove ? "bottom right" : "top right"
        );
      }
    };

    const startRepositionLoop = () => {
      const step = () => {
        positionPopover();
        repositionRaf = requestAnimationFrame(step);
      };
      step();
    };

    const stopRepositionLoop = () => {
      if (repositionRaf !== null) {
        cancelAnimationFrame(repositionRaf);
        repositionRaf = null;
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
        startRepositionLoop();
      } else {
        stopRepositionLoop();
        handleUnlock();
      }
    };

    const observer = new MutationObserver(checkOpenState);

    observer.observe(el, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-open", "aria-expanded"],
    });

    window.addEventListener("resize", positionPopover);

    return () => {
      observer.disconnect();
      stopRepositionLoop();
      window.removeEventListener("resize", positionPopover);
      handleUnlock();
    };
  }, []);

  return (
    <div className={className} ref={containerRef}>
      <ColorControl {...props} />
    </div>
  );
};
