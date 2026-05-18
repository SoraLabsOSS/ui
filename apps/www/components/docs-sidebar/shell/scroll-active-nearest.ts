'use client';

import { useEffect, useRef } from 'react';

/** Attribute on the scroll viewport (Radix ScrollArea) for nearest-edge scroll-into-view. */
export const DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR =
  'data-docs-sidebar-scroll-viewport';

export function useScrollActiveItemIntoView(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const scrolled = useRef(false);

  useEffect(() => {
    if (!active || scrolled.current || !ref.current) return;
    scrolled.current = true;
    const el = ref.current;
    const schedule =
      typeof requestIdleCallback !== 'undefined'
        ? (cb: () => void) => requestIdleCallback(cb)
        : (cb: () => void) => setTimeout(cb, 100);
    const cancel =
      typeof cancelIdleCallback !== 'undefined'
        ? cancelIdleCallback
        : clearTimeout;
    const id = schedule(() => {
      const viewport = el.closest(`[${DOCS_SIDEBAR_SCROLL_VIEWPORT_ATTR}]`);
      if (!(viewport instanceof HTMLElement)) return;
      const vpRect = viewport.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const pad = 12;
      let delta = 0;
      if (elRect.top < vpRect.top + pad) {
        delta = elRect.top - vpRect.top - pad;
      } else if (elRect.bottom > vpRect.bottom - pad) {
        delta = elRect.bottom - vpRect.bottom + pad;
      }
      if (delta !== 0) viewport.scrollBy({ top: delta, behavior: 'smooth' });
    });
    return () => cancel(id as number);
  }, [active]);

  useEffect(() => {
    if (!active) scrolled.current = false;
  }, [active]);

  return ref;
}
