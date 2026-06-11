"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/ui/breadcrumb";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { useCatalogMenu } from "./catalog-menu-context";
import {
  catalogDocsHeaderClassName,
  catalogDocsHeaderInsetClassName,
  catalogMenuButtonMobileOpenClassName,
} from "./catalog-preview-classes";
import { ComponentPageCatalogMenuButton } from "./component-page-catalog-menu-button";

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

  return (
    <header
      className={cn(
        catalogDocsHeaderClassName,
        catalogDocsHeaderInsetClassName,
        open ? "max-lg:bg-transparent" : "max-lg:bg-background",
        !open &&
          "max-lg:transition-colors max-lg:duration-450 max-lg:ease-[cubic-bezier(0.32,0.72,0,1)]",
        "lg:bg-transparent"
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-3",
          open && catalogMenuButtonMobileOpenClassName
        )}
      >
        <ComponentPageCatalogMenuButton />

        {open ? null : (
          <Breadcrumb>
            <BreadcrumbList className="gap-1.5 text-sm sm:gap-2.5">
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
    </header>
  );
}
