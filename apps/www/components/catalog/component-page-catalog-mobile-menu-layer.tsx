"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  catalogChromeToolbarClassName,
  catalogDocsHeaderMenuClassName,
  catalogMobileMenuChipFixedClassName,
} from "./catalog-preview-classes";
import { ComponentPageCatalogMenuButton } from "./component-page-catalog-menu-button";
import { useCatalogStackedLayout } from "./use-catalog-stacked-layout";

const mobileMenuChipClassName = cn(
  catalogDocsHeaderMenuClassName,
  "flex items-center",
  catalogChromeToolbarClassName
);

/**
 * Mobile menu chip on a stable body layer (`z-[90]`).
 * Portaled once so toggle morph + extra toolbar icons never remount.
 */
export function ComponentPageCatalogMobileMenuLayer() {
  const isStacked = useCatalogStackedLayout();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!(isStacked && mounted)) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        mobileMenuChipClassName,
        catalogMobileMenuChipFixedClassName
      )}
    >
      <ComponentPageCatalogMenuButton />
    </div>,
    document.body
  );
}
