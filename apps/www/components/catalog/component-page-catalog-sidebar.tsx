"use client";

import { ProgressiveBlur } from "@workspace/ui/components/ui/progressive-blur";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCatalogMenu } from "./catalog-menu-context";
import {
  catalogDesktopSidebarAsideClassName,
  catalogDesktopSidebarPanelClassName,
  catalogSidebarBackdropClassName,
} from "./catalog-preview-classes";
import { ComponentPageCatalogNav } from "./component-page-catalog-nav";
import { useCatalogStackedLayout } from "./use-catalog-stacked-layout";

const SIDEBAR_TRANSITION = {
  duration: 0.45,
  ease: [0.32, 0.72, 0, 1] as const,
};

// Both variants animate a small offset (not a full off-canvas slide): moving
// a `backdrop-filter` element across the screen forces the browser to
// resample a different region of background on every frame, which is far
// more expensive than fading it in place. A small x offset keeps the
// directional "slide" feel without that per-frame resampling cost.
function getPanelMotion(isStacked: boolean) {
  const offset = isStacked ? -24 : -16;
  return {
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: offset },
    initial: { opacity: 0, x: offset },
  };
}

export function ComponentPageCatalogSidebar() {
  const { close, navItems, open } = useCatalogMenu();
  const isStacked = useCatalogStackedLayout();
  const [mounted, setMounted] = useState(false);
  const panelMotion = getPanelMotion(isStacked);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!(open && isStacked)) {
      return;
    }

    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-catalog-scroll-root]"
    );
    if (!scrollRoot) {
      return;
    }

    const scrollTop = scrollRoot.scrollTop;
    const previousOverflow = scrollRoot.style.overflow;
    scrollRoot.style.overflow = "hidden";

    return () => {
      if (!scrollRoot.isConnected) {
        return;
      }

      scrollRoot.style.overflow = previousOverflow;
      scrollRoot.scrollTop = scrollTop;
    };
  }, [isStacked, open]);

  const overlay = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close components menu"
            className={catalogSidebarBackdropClassName}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="catalog-sidebar-backdrop"
            onClick={close}
            transition={SIDEBAR_TRANSITION}
            type="button"
          />
          <div
            className={catalogDesktopSidebarAsideClassName}
            key="catalog-sidebar-panel"
          >
            {/*
              backdrop-blur lives on the SAME element that animates (not a
              descendant of an animated ancestor) — Chromium/WebKit only keep
              backdrop-filter in sync with the compositor on the transformed
              layer itself; on a plain descendant it renders a stale (blank)
              backdrop until the transform settles, then pops in.
            */}
            <motion.div
              animate={panelMotion.animate}
              aria-label="Components"
              aria-modal="true"
              className={cn(catalogDesktopSidebarPanelClassName, "relative")}
              exit={panelMotion.exit}
              initial={panelMotion.initial}
              role="dialog"
              style={{ willChange: "transform, opacity, backdrop-filter" }}
              transition={SIDEBAR_TRANSITION}
            >
              <ProgressiveBlur
                backgroundColor="color-mix(in oklab, var(--background) 35%, transparent)"
                blurAmount="12px"
                className="z-10 rounded-t-3xl"
                height="5.5rem"
                maskFadeStart="35%"
                position="top"
              />
              <ProgressiveBlur
                backgroundColor="color-mix(in oklab, var(--background) 35%, transparent)"
                blurAmount="12px"
                className="z-10 rounded-b-3xl"
                height="4rem"
                maskFadeStart="35%"
                position="bottom"
              />

              <ComponentPageCatalogNav items={navItems} onNavigate={close} />
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(overlay, document.body);
}
