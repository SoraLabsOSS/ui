import type { ReactNode } from "react";
import { ComponentPageCatalogShell } from "@/components/catalog/component-page-catalog-shell";
import { ComponentsExperimentalGate } from "@/components/catalog/components-experimental-gate";
import { ComponentsShell } from "@/components/catalog/components-shell";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navItems = getComponentGalleryItems();

  return (
    <ComponentsShell>
      <ComponentsExperimentalGate>
        <ComponentPageCatalogShell navItems={navItems}>
          {children}
        </ComponentPageCatalogShell>
      </ComponentsExperimentalGate>
    </ComponentsShell>
  );
}
