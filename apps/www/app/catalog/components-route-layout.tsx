"use client";

import { useSidebar } from "fumadocs-ui/provider";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { ComponentPageCatalogShell } from "@/components/catalog/component-page-catalog-shell";
import { ComponentsShell } from "@/components/catalog/components-shell";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { ComponentsGalleryLayout } from "./components-gallery-layout";

function releaseCatalogDocumentScroll() {
  document.documentElement.classList.remove("catalog-scroll-lock");
  document.body.style.removeProperty("overflow");
  delete document.documentElement.dataset.catalogMenuOpen;
}

interface ComponentsRouteLayoutProps {
  children: ReactNode;
  navItems: ComponentGalleryItem[];
  primitivesUrl: string;
}

export function ComponentsRouteLayout({
  children,
  navItems,
  primitivesUrl,
}: ComponentsRouteLayoutProps) {
  const pathname = usePathname();
  const isGalleryIndex = pathname === "/components";
  const { setOpen: setSidebarOpen } = useSidebar();

  useEffect(
    () => () => {
      setSidebarOpen(false);
      releaseCatalogDocumentScroll();
    },
    [setSidebarOpen]
  );

  if (isGalleryIndex) {
    return (
      <ComponentsGalleryLayout primitivesUrl={primitivesUrl}>
        {children}
      </ComponentsGalleryLayout>
    );
  }

  return (
    <ComponentsShell>
      <ComponentPageCatalogShell navItems={navItems}>
        {children}
      </ComponentPageCatalogShell>
    </ComponentsShell>
  );
}
