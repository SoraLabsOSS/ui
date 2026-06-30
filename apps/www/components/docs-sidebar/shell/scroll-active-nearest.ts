"use client";

import { useEffect, useRef } from "react";

/** Attribute on the scroll viewport (Radix ScrollArea) for nearest-edge scroll-into-view. */
export const DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR =
  "data-docs-sidebar-scroll-viewport";

const VIEWPORT_PAD = 12;
const RETRY_DELAYS_MS = [0, 50, 150, 350, 600];
const MAX_ATTEMPTS = 12;

function findScrollViewport(el: HTMLElement): HTMLElement | null {
  const marked = el.closest(`[${DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR}]`);
  if (marked instanceof HTMLElement) {
    return marked;
  }
  const radix = el.closest("[data-radix-scroll-area-viewport]");
  return radix instanceof HTMLElement ? radix : null;
}

function scrollDelta(el: HTMLElement, viewport: HTMLElement): number {
  const vpRect = viewport.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  if (elRect.top < vpRect.top + VIEWPORT_PAD) {
    return elRect.top - vpRect.top - VIEWPORT_PAD;
  }
  if (elRect.bottom > vpRect.bottom - VIEWPORT_PAD) {
    return elRect.bottom - vpRect.bottom + VIEWPORT_PAD;
  }
  return 0;
}

function applyScroll(
  el: HTMLElement,
  viewport: HTMLElement,
  behavior: ScrollBehavior
): void {
  const delta = scrollDelta(el, viewport);
  if (delta === 0) {
    return;
  }
  viewport.scrollTo({
    top: viewport.scrollTop + delta,
    behavior,
  });
}

export function useScrollActiveItemIntoView(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const scrolled = useRef(false);

  useEffect(() => {
    if (!active || scrolled.current) {
      return;
    }

    const el = ref.current;
    if (!el) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    const tryScroll = () => {
      if (cancelled || scrolled.current) {
        return;
      }
      attempts += 1;

      const node = ref.current;
      if (!node) {
        return;
      }

      const viewport = findScrollViewport(node);
      if (!viewport) {
        if (attempts >= MAX_ATTEMPTS) {
          scrolled.current = true;
        }
        return;
      }

      const delta = scrollDelta(node, viewport);
      if (delta === 0) {
        scrolled.current = true;
        return;
      }

      applyScroll(node, viewport, "smooth");
      // Mark done immediately so retries don't fire a second scroll
      // while the smooth animation is still in progress.
      scrolled.current = true;
    };

    const schedule = (fn: () => void, delayMs: number) => {
      if (delayMs === 0) {
        requestAnimationFrame(() => requestAnimationFrame(fn));
        return;
      }
      timeoutIds.push(setTimeout(fn, delayMs));
    };

    for (const delay of RETRY_DELAYS_MS) {
      schedule(tryScroll, delay);
    }

    const resizeObserver = new ResizeObserver(() => {
      const node = ref.current;
      if (!node || cancelled || scrolled.current) {
        return;
      }
      const viewport = findScrollViewport(node);
      if (!viewport || scrollDelta(node, viewport) === 0) {
        return;
      }
      tryScroll();
    });
    resizeObserver.observe(el);
    const viewport = findScrollViewport(el);
    if (viewport) {
      resizeObserver.observe(viewport);
    }

    return () => {
      cancelled = true;
      for (const id of timeoutIds) {
        clearTimeout(id);
      }
      resizeObserver.disconnect();
    };
  }, [active]);

  useEffect(() => {
    if (!active) {
      scrolled.current = false;
    }
  }, [active]);

  return ref;
}
