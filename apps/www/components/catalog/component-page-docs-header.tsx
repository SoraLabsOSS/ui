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
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 lg:gap-2.5",
          catalogDocsHeaderDesktopRowClassName
        )}
      >
        {/* Mobile menu lives in ComponentPageCatalogMobileMenuLayer — spacer only */}
        <div aria-hidden className="size-11 shrink-0 lg:hidden" />

        <div className="hidden h-full items-center lg:flex">
          <ComponentPageCatalogMenuButton variant="plain" />
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
        <div className={cn(catalogDocsHeaderMenuClassName, "lg:hidden")}>
          {toolbar}
        </div>
      ) : null}
    </header>
  );
}
