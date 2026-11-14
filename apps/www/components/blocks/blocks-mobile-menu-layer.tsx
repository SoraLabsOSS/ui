"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ComponentPageBlocksMenuButton } from "./blocks-menu-button";
import { useBlocksMenu } from "./blocks-menu-context";
import {
  blocksMobileMenuChipFixedClassName,
  blocksMobileMenuChipIdleLayerClassName,
  blocksMobileMenuChipMenuOpenLayerClassName,
} from "./blocks-preview-classes";
import { useBlocksStackedLayout } from "./use-blocks-stacked-layout";

/**
 * Mobile menu chip on a stable body layer.
 * Idle `z-[90]` stays under AI chat; open `z-[120]` stays above the flyout.
 * Portaled once so toggle morph + extra toolbar icons never remount.
 */
export function ComponentPageBlocksMobileMenuLayer() {
  const isStacked = useBlocksStackedLayout();
  const { open } = useBlocksMenu();
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
        blocksMobileMenuChipFixedClassName,
        open
          ? blocksMobileMenuChipMenuOpenLayerClassName
          : blocksMobileMenuChipIdleLayerClassName
      )}
    >
      <ComponentPageBlocksMenuButton variant="solo" />
    </div>,
    document.body
  );
}
