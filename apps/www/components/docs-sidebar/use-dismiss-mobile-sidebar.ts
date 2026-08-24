"use client";

import { useSidebar } from "fumadocs-ui/provider";
import { useEffect } from "react";
import {
  closeMobileSidebar,
  isMobileSidebarSuppressed,
} from "./sidebar-close-lock";

const SIDEBAR_PANEL = "[data-docs-sidebar]";
const MENU_TOGGLE = "[data-sidebar-menu-toggle]";

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

/**
 * Close the drawer on outside pointer / Escape. Ignores the header hamburger
 * so capture-phase pointerdown does not close and the click then toggle-open.
 */
export function useDismissMobileSidebarOnOutside() {
  const { open, setOpen } = useSidebar();
  const drawerOpen = open && !isMobileSidebarSuppressed();

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const media = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      if (media.matches) {
        document.body.style.overflow = "hidden";
        return;
      }
      document.body.style.removeProperty("overflow");
    };

    apply();
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
      document.body.style.removeProperty("overflow");
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!isMobileViewport()) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest(MENU_TOGGLE)) {
        return;
      }
      const panel = document.querySelector(SIDEBAR_PANEL);
      if (panel?.contains(target)) {
        return;
      }
      closeMobileSidebar(setOpen);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileSidebar(setOpen);
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, setOpen]);
}
