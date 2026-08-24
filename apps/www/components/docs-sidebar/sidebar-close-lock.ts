"use client";

import { usePathname } from "next/navigation";

/** Cover leftover taps on the header hamburger after a nav close. */
export const MOBILE_SIDEBAR_CLOSE_LOCK_MS = 500;

let closeLocked = false;
let closeLockTimer: ReturnType<typeof setTimeout> | null = null;
let suppressUntilExplicitOpen = false;
let lastPathname: string | null = null;

function armCloseLock() {
  closeLocked = true;
  if (typeof window === "undefined") {
    return;
  }
  if (closeLockTimer !== null) {
    window.clearTimeout(closeLockTimer);
  }
  closeLockTimer = window.setTimeout(() => {
    closeLocked = false;
    closeLockTimer = null;
  }, MOBILE_SIDEBAR_CLOSE_LOCK_MS);
}

/** Ignore hamburger re-opens from click-through after the drawer starts closing. */
export function markMobileSidebarClosed() {
  suppressUntilExplicitOpen = true;
  armCloseLock();
}

export function allowMobileSidebarOpen() {
  suppressUntilExplicitOpen = false;
}

export function isMobileSidebarCloseLocked() {
  return closeLocked;
}

/**
 * Fumadocs `useOnChange(pathname)` still renders children once with `open`
 * true. Keep the panel visually closed across that frame and across layout
 * remounts until the user opens the hamburger again.
 */
export function isMobileSidebarSuppressed() {
  return suppressUntilExplicitOpen;
}

export function closeMobileSidebar(setOpen: (open: boolean) => void) {
  markMobileSidebarClosed();
  setOpen(false);
}

export function useSyncMobileSidebarPathname() {
  const pathname = usePathname();
  if (lastPathname !== pathname) {
    if (lastPathname !== null) {
      suppressUntilExplicitOpen = true;
    }
    lastPathname = pathname;
  }
}
