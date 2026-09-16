"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { useCatalogMenu } from "./catalog-menu-context";
import { useCatalogMobileChrome } from "./catalog-mobile-chrome-context";
import {
  catalogDocsHeaderBreadcrumbClassName,
  catalogDocsHeaderClassName,
  catalogDocsHeaderDesktopRowClassName,
  catalogDocsHeaderInsetClassName,
  catalogDocsHeaderMenuClassName,
  catalogDocsHeaderMobileSymmetricClassName,
} from "./catalog-preview-classes";
import { ComponentPageCatalogMenuButton } from "./component-page-catalog-menu-button";
import { ComponentPageDocsBreadcrumb } from "./component-page-docs-breadcrumb";

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
  const { open } = useCatalogMenu();
  const { toolbar } = useCatalogMobileChrome();

  return (
    <header
      className={cn(
        catalogDocsHeaderClassName,
        catalogDocsHeaderInsetClassName,
        catalogDocsHeaderMobileSymmetricClassName,
        "pointer-events-none gap-3 lg:bg-transparent"
      )}
    >
      <div
        className={cn(
          "pointer-events-none flex min-w-0 items-center gap-3 lg:gap-2.5",
          isExpanded ? "w-fit" : "flex-1",
          catalogDocsHeaderDesktopRowClassName
        )}
      >
        {/* Mobile menu lives in ComponentPageCatalogMobileMenuLayer — spacer only */}
        <div aria-hidden className="size-11 shrink-0 lg:hidden" />

        <div className="pointer-events-auto hidden items-center lg:flex">
          <ComponentPageCatalogMenuButton
            isExpanded={isExpanded}
            variant="morph"
          />
        </div>

        <ComponentPageDocsBreadcrumb
          className={cn(
            catalogDocsHeaderBreadcrumbClassName,
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
            catalogDocsHeaderMenuClassName,
            "pointer-events-auto lg:hidden"
          )}
        >
          {toolbar}
        </div>
      ) : null}
    </header>
  );
}
