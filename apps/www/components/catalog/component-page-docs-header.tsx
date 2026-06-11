"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { useCatalogMenu } from "./catalog-menu-context";
import { useCatalogMobileChrome } from "./catalog-mobile-chrome-context";
import {
  catalogChromeToolbarClassName,
  catalogDocsHeaderBreadcrumbClassName,
  catalogDocsHeaderClassName,
  catalogDocsHeaderInsetClassName,
  catalogDocsHeaderMenuClassName,
  catalogDocsHeaderMobileSymmetricClassName,
  catalogMobileChromeInteractiveClassName,
} from "./catalog-preview-classes";
import { ComponentPageCatalogMenuButton } from "./component-page-catalog-menu-button";
import { ComponentPageDocsBreadcrumb } from "./component-page-docs-breadcrumb";

interface ComponentPageDocsHeaderProps {
  isExpanded?: boolean;
  navItems: ComponentGalleryItem[];
  title: string;
}

const menuChipClassName = cn(
  catalogDocsHeaderMenuClassName,
  "max-lg:flex max-lg:items-center",
  catalogChromeToolbarClassName,
  "lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none"
);

export function ComponentPageDocsHeader({
  isExpanded: _isExpanded = false,
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
        "gap-3 lg:bg-transparent"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={cn(
            menuChipClassName,
            open && catalogMobileChromeInteractiveClassName
          )}
        >
          <ComponentPageCatalogMenuButton />
        </div>

        <ComponentPageDocsBreadcrumb
          className={cn(
            catalogDocsHeaderBreadcrumbClassName,
            "max-lg:hidden",
            open && "lg:hidden"
          )}
          title={title}
        />
      </div>

      {toolbar ? (
        <div
          className={cn(
            catalogDocsHeaderMenuClassName,
            "lg:hidden",
            open && "max-lg:hidden"
          )}
        >
          {toolbar}
        </div>
      ) : null}
    </header>
  );
}
