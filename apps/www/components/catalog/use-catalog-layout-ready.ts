"use client";

import {
  type RefObject,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";

const LG_MEDIA = "(min-width: 1024px)";

interface CatalogLayoutReadyState {
  isLargeScreen: boolean;
  isReady: boolean;
}

function subscribeLargeScreen(onStoreChange: () => void) {
  const media = window.matchMedia(LG_MEDIA);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getLargeScreenSnapshot() {
  return window.matchMedia(LG_MEDIA).matches;
}

export function useCatalogLayoutReady(
  layoutRef: RefObject<HTMLDivElement | null>
): CatalogLayoutReadyState {
  const isLargeScreen = useSyncExternalStore(
    subscribeLargeScreen,
    getLargeScreenSnapshot,
    () => true
  );
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const node = layoutRef.current;
    if (!node) {
      return;
    }

    let cancelled = false;

    const syncLayoutWidth = () => {
      node.style.setProperty("--catalog-layout-width", `${node.clientWidth}px`);
    };

    syncLayoutWidth();

    let initialSizeSynced = false;
    const observer = new ResizeObserver(() => {
      syncLayoutWidth();
      if (!(initialSizeSynced || cancelled)) {
        initialSizeSynced = true;
        setIsReady(true);
      }
    });
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [layoutRef]);

  return { isLargeScreen, isReady };
}
