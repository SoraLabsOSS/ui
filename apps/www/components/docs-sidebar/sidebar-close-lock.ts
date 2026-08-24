"use client";

import { usePathname } from "next/navigation";

/** Cover leftover taps on the header hamburger after a nav close. */
export const MOBILE_SIDEBAR_CLOSE_LOCK_MS = 500;

let lockedUntil = 0;
let suppressUntilExplicitOpen = false;
let lastPathname: string | null = null;

/** Ignore hamburger re-opens from click-through after the drawer starts closing. */
export function markMobileSidebarClosed() {
  suppressUntilExplicitOpen = true;
  lockedUntil = Date.now() + MOBILE_SIDEBAR_CLOSE_LOCK_MS;
}

export function allowMobileSidebarOpen() {
  suppressUntilExplicitOpen = false;
}

export function isMobileSidebarCloseLocked() {
  return Date.now() < lockedUntil;
}

/**
 * Fumadocs `useOnChange(pathname)` still renders children once with `open`
 * true. Keep the panel visually closed across that frame and across layout
 * remounts until the user opens the hamburger again.
 */
export function isMobileSidebarSuppressed() {
  return suppressUntilExplicitOpen || Date.now() < lockedUntil;
}

export function closeMobileSidebar(setOpen: (open: boolean) => void) {
  markMobileSidebarClosed();
  setOpen(false);
}

export function useSyncMobileSidebarPathname() {
  const pathname = usePathname();
  if (lastPathname !== pathname) {
    if (lastPathname !== null) {
      markMobileSidebarClosed();
    }
    lastPathname = pathname;
  }
}
