"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCatalogMenu } from "./catalog-menu-context";
import {
  catalogMobileMenuChipFixedClassName,
  catalogMobileMenuChipIdleLayerClassName,
  catalogMobileMenuChipMenuOpenLayerClassName,
} from "./catalog-preview-classes";
import { ComponentPageCatalogMenuButton } from "./component-page-catalog-menu-button";
import { useCatalogStackedLayout } from "./use-catalog-stacked-layout";

/**
 * Mobile menu chip on a stable body layer.
 * Idle `z-[90]` stays under AI chat; open `z-[120]` stays above the flyout.
 * Portaled once so toggle morph + extra toolbar icons never remount.
 */
export function ComponentPageCatalogMobileMenuLayer() {
  const isStacked = useCatalogStackedLayout();
  const { open } = useCatalogMenu();
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
        catalogMobileMenuChipFixedClassName,
        open
          ? catalogMobileMenuChipMenuOpenLayerClassName
          : catalogMobileMenuChipIdleLayerClassName
      )}
    >
      <ComponentPageCatalogMenuButton variant="solo" />
    </div>,
    document.body
  );
}
