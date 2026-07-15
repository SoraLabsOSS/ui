"use client";

import { useEffect, useRef } from "react";

/** Custom dot cursor that scales up over links/buttons. Desktop (hover-capable) only. */
export function SiteCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = ref.current;
    if (!cursor) {
      return;
    }
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    document.addEventListener("mousemove", onMove);

    const interactive = document.querySelectorAll<HTMLElement>(
      "a, button, [data-cursor-hover]"
    );
    const onEnter = () => cursor.classList.add("scale-[5]");
    const onLeave = () => cursor.classList.remove("scale-[5]");
    for (const el of interactive) {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    }

    return () => {
      document.removeEventListener("mousemove", onMove);
      for (const el of interactive) {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      }
    };
  }, []);

  return (
    <div
      className="ease pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference transition-transform duration-[250ms] max-[1024px]:hidden"
      ref={ref}
    />
  );
}
