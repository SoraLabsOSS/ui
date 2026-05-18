'use client';

import { useSidebar } from 'fumadocs-ui/provider';
import { useEffect } from 'react';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';

const MOBILE_SIDEBAR_ID = 'nd-sidebar-mobile';

/**
 * Fumadocs renders a full-screen backdrop (z-40) plus a panel (~85% width).
 * Page content is a later sibling in #nd-docs-layout and can sit above the
 * backdrop in the stacking order, so taps on the “dimmed” area often miss the
 * backdrop onClick. This closes the drawer on any pointer down outside the panel.
 */
export function useDismissMobileSidebarOnOutside() {
  const isMobile = useIsMobile();
  const { open, setOpen } = useSidebar();

  useEffect(() => {
    if (!isMobile || !open) return;

    const onPointerDown = (event: PointerEvent) => {
      const panel = document.getElementById(MOBILE_SIDEBAR_ID);
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panel?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true);
  }, [isMobile, open, setOpen]);
}
