"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ComponentPageCatalogShell } from "@/components/catalog/component-page-catalog-shell";
import { ComponentsShell } from "@/components/catalog/components-shell";
import type { ComponentGalleryItem } from "@/lib/registry/types";
import { ComponentsGalleryLayout } from "./components-gallery-layout";

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
