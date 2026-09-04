import type { ReactNode } from "react";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";
import { ComponentsRouteLayout } from "./components-route-layout";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navItems = getComponentGalleryItems();
  const primitivesUrl = getFirstPrimitiveDocUrl();

  return (
    <ComponentsRouteLayout navItems={navItems} primitivesUrl={primitivesUrl}>
      {children}
    </ComponentsRouteLayout>
  );
}
