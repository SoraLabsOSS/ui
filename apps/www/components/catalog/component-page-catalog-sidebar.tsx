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

function getPanelMotion(isStacked: boolean) {
  if (isStacked) {
    return {
      animate: { x: 0 },
      exit: { x: "-100%" },
      initial: { x: "-100%" },
    };
  }

  return {
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
    initial: { opacity: 0, x: -16 },
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
          <motion.div
            animate={panelMotion.animate}
            aria-label="Components"
            aria-modal="true"
            className={catalogDesktopSidebarAsideClassName}
            exit={panelMotion.exit}
            initial={panelMotion.initial}
            key="catalog-sidebar-panel"
            role="dialog"
            transition={SIDEBAR_TRANSITION}
          >
            <div
              className={cn(catalogDesktopSidebarPanelClassName, "relative")}
            >
              <ProgressiveBlur
                backgroundColor="var(--muted)"
                blurAmount="12px"
                className="z-10 rounded-t-3xl"
                height="5.5rem"
                maskFadeStart="35%"
                position="top"
              />
              <ProgressiveBlur
                backgroundColor="var(--muted)"
                blurAmount="12px"
                className="z-10 rounded-b-3xl"
                height="4rem"
                maskFadeStart="35%"
                position="bottom"
              />

              <ComponentPageCatalogNav items={navItems} onNavigate={close} />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(overlay, document.body);
}
