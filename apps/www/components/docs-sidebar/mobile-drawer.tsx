"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useSidebar } from "fumadocs-ui/provider";
import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useState,
} from "react";
import {
  closeMobileSidebar,
  isMobileSidebarSuppressed,
  MOBILE_SIDEBAR_CLOSE_LOCK_MS,
  useSyncMobileSidebarPathname,
} from "./sidebar-close-lock";

/**
 * Mobile drawer that stays in the DOM (transform, not Dialog/Presence).
 *
 * Unmounting to swap `useIsMobile` trees or replay enter animations is what
 * caused the close → flash → close flicker. After a route close we keep the
 * panel suppressed until the hamburger opens it again, and the overlay keeps
 * pointer-events so a leftover tap cannot toggle the menu back open.
 */
export function DocsMobileDrawer({
  children,
  className,
  desktopClassName,
  desktopStyle,
  label,
  layout = "drawer",
}: {
  children: ReactNode;
  className?: string;
  desktopClassName?: string;
  desktopStyle?: CSSProperties;
  label: string;
  /** `responsive` = one tree for mobile drawer + desktop rail. */
  layout?: "drawer" | "responsive";
}) {
  useSyncMobileSidebarPathname();
  const { open, setOpen } = useSidebar();
  const [canAnimate, setCanAnimate] = useState(false);
  const [overlayLocked, setOverlayLocked] = useState(false);

  const show = open && !isMobileSidebarSuppressed();

  useLayoutEffect(() => {
    if (open && isMobileSidebarSuppressed()) {
      setOpen(false);
    }
  }, [open, setOpen]);

  useLayoutEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setCanAnimate(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useLayoutEffect(() => {
    if (show) {
      setOverlayLocked(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOverlayLocked(false);
    }, MOBILE_SIDEBAR_CLOSE_LOCK_MS);
    return () => window.clearTimeout(timeoutId);
  }, [show]);

  const state = show ? "open" : "closed";
  const raised = show || overlayLocked;
  const isResponsive = layout === "responsive";
  const motionClass = canAnimate
    ? "max-md:transition-transform max-md:duration-250 max-md:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:max-md:transition-none"
    : "max-md:transition-none";
  const drawerMotionClass = canAnimate
    ? "transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
    : "transition-none";

  return (
    <>
      <button
        aria-hidden={!raised}
        aria-label="Close menu"
        className={cn(
          "fixed inset-0 z-[60] cursor-default backdrop-blur-xs transition-opacity duration-250 motion-reduce:transition-none md:hidden",
          show ? "opacity-100" : "opacity-0",
          show || overlayLocked ? "pointer-events-auto" : "pointer-events-none"
        )}
        onPointerDown={(event) => {
          event.preventDefault();
          closeMobileSidebar(setOpen);
        }}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-hidden={isResponsive ? undefined : !show}
        aria-label={label}
        className={cn(
          "flex min-h-0 flex-col overflow-hidden bg-fd-background outline-none",
          isResponsive
            ? cn(
                "max-md:fixed max-md:inset-y-2 max-md:start-2 max-md:z-40 max-md:w-[min(300px,calc(100vw-1.5rem))] max-md:max-w-[min(300px,calc(100vw-1.5rem))] max-md:rounded-2xl max-md:border max-md:text-[15px] max-md:shadow-lg",
                motionClass,
                show
                  ? "max-md:translate-x-0"
                  : "max-md:pointer-events-none max-md:-translate-x-[calc(100%+1.25rem)]",
                raised && "max-md:z-[61]",
                "md:pointer-events-auto md:fixed md:inset-s-0 md:top-(--fd-sidebar-top) md:bottom-(--fd-sidebar-margin,0px) md:z-20 md:translate-x-0 md:items-end md:rounded-none md:border-e md:bg-fd-card md:text-sm md:shadow-none",
                "md:*:w-(--fd-sidebar-width)",
                desktopClassName
              )
            : cn(
                "fixed inset-y-2 start-2 z-40 w-[min(300px,calc(100vw-1.5rem))] max-w-[min(300px,calc(100vw-1.5rem))] rounded-2xl border text-[15px] shadow-lg md:hidden",
                drawerMotionClass,
                show
                  ? "translate-x-0"
                  : "pointer-events-none -translate-x-[calc(100%+1.25rem)]",
                raised && "z-[61]"
              ),
          className
        )}
        data-docs-sidebar=""
        data-state={state}
        id={isResponsive ? "nd-sidebar" : "nd-sidebar-mobile"}
        style={isResponsive ? desktopStyle : undefined}
      >
        {children}
      </aside>
    </>
  );
}
