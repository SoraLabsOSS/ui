"use client";

import { useSyncExternalStore } from "react";

const STACKED_MEDIA = "(max-width: 1023px)";

function subscribeStacked(onStoreChange: () => void) {
  const media = window.matchMedia(STACKED_MEDIA);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getStackedSnapshot() {
  return window.matchMedia(STACKED_MEDIA).matches;
}

/**
 * Matches catalog `max-lg` split layout (preview stacked above docs).
 *
 * Server snapshot returns false (desktop) so SSR and initial hydration both render
 * the desktop JSX branch — no hydration mismatch. The single-frame shift to the
 * stacked branch post-hydration is minimized by ResizeObserver-based isReady and
 * removal of the key-forced remount on the preview motion.div.
 */
export function useCatalogStackedLayout() {
  return useSyncExternalStore(
    subscribeStacked,
    getStackedSnapshot,
    () => false
  );
}
