"use client";

import type { ReactNode } from "react";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { CatalogMenuProvider } from "./catalog-menu-context";
import { CatalogMobileChromeProvider } from "./catalog-mobile-chrome-context";
import { ComponentPageCatalogMobileMenuLayer } from "./component-page-catalog-mobile-menu-layer";
import { ComponentPageCatalogSidebar } from "./component-page-catalog-sidebar";

interface ComponentPageCatalogShellProps {
  children: ReactNode;
  navItems: ComponentGalleryItem[];
}

export function ComponentPageCatalogShell({
  children,
  navItems,
}: ComponentPageCatalogShellProps) {
  return (
    <CatalogMenuProvider navItems={navItems}>
      <CatalogMobileChromeProvider>
        <ComponentPageCatalogMobileMenuLayer />
        <ComponentPageCatalogSidebar />
        <div className="min-h-0 min-w-0 flex-1">{children}</div>
      </CatalogMobileChromeProvider>
    </CatalogMenuProvider>
  );
}
