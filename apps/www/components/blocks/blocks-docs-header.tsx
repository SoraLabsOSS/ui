"use client";

import { cn } from "@workspace/ui/lib/utils";

import type { ComponentGalleryItem } from "@/lib/registry/types";

import { ComponentPageDocsBreadcrumb } from "./blocks-docs-breadcrumb";
import { ComponentPageBlocksMenuButton } from "./blocks-menu-button";
import { useBlocksMenu } from "./blocks-menu-context";
import { useBlocksMobileChrome } from "./blocks-mobile-chrome-context";
import {
  blocksDocsHeaderBreadcrumbClassName,
  blocksDocsHeaderClassName,
  blocksDocsHeaderDesktopRowClassName,
  blocksDocsHeaderInsetClassName,
  blocksDocsHeaderMenuClassName,
  blocksDocsHeaderMobileSymmetricClassName,
} from "./blocks-preview-classes";

interface ComponentPageDocsHeaderProps {
  isExpanded?: boolean;
  navItems: ComponentGalleryItem[];
  title: string;
}

export function ComponentPageDocsHeader({
  isExpanded = false,
  title,
  navItems: _navItems,
}: ComponentPageDocsHeaderProps) {
  const { open } = useBlocksMenu();
  const { toolbar } = useBlocksMobileChrome();

  return (
    <header
      className={cn(
        blocksDocsHeaderClassName,
        blocksDocsHeaderInsetClassName,
        blocksDocsHeaderMobileSymmetricClassName,
        "pointer-events-none gap-3 lg:bg-transparent"
      )}
    >
      <div
        className={cn(
          "pointer-events-none flex min-w-0 items-center gap-3 lg:gap-2.5",
          isExpanded ? "w-fit" : "flex-1",
          blocksDocsHeaderDesktopRowClassName
        )}
      >
        {/* Mobile menu lives in ComponentPageBlocksMobileMenuLayer — spacer only */}
        <div aria-hidden className="size-11 shrink-0 lg:hidden" />

        <div className="pointer-events-auto hidden items-center lg:flex">
          <ComponentPageBlocksMenuButton
            isExpanded={isExpanded}
            variant="morph"
          />
        </div>

        <ComponentPageDocsBreadcrumb
          className={cn(
            blocksDocsHeaderBreadcrumbClassName,
            "transition-opacity duration-200 ease-out max-lg:hidden",
            open || isExpanded
              ? "pointer-events-none opacity-0"
              : "pointer-events-auto opacity-100"
          )}
          title={title}
        />
      </div>

      {toolbar ? (
        <div
          className={cn(
            blocksDocsHeaderMenuClassName,
            "pointer-events-auto lg:hidden"
          )}
        >
          {toolbar}
        </div>
      ) : null}
    </header>
  );
}
