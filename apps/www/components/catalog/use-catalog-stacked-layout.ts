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

/** Matches catalog `max-lg` split layout (preview stacked above docs). */
export function useCatalogStackedLayout() {
  return useSyncExternalStore(
    subscribeStacked,
    getStackedSnapshot,
    () => false
  );
}
