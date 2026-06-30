"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

const LG_MEDIA = "(min-width: 1024px)";

interface CatalogLayoutReadyState {
  isLargeScreen: boolean;
  isReady: boolean;
}

export function useCatalogLayoutReady(
  layoutRef: RefObject<HTMLDivElement | null>
): CatalogLayoutReadyState {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const node = layoutRef.current;
    if (!node) {
      return;
    }

    let cancelled = false;

    const media = window.matchMedia(LG_MEDIA);
    const syncLayoutWidth = () => {
      node.style.setProperty("--catalog-layout-width", `${node.clientWidth}px`);
    };

    const syncLargeScreen = () => {
      setIsLargeScreen(media.matches);
      syncLayoutWidth();
    };
    syncLargeScreen();
    media.addEventListener("change", syncLargeScreen);

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
      media.removeEventListener("change", syncLargeScreen);
    };
  }, [layoutRef]);

  return { isLargeScreen, isReady };
}
