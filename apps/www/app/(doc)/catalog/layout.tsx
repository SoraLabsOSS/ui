import type { ReactNode } from "react";
import { getFirstPrimitiveDocUrl } from "@/lib/docs/get-first-primitive-doc-url";
import { getReleaseDatesByUrl } from "@/lib/docs/get-release-dates-by-url";
import { source } from "@/lib/docs/source";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";
import { getFirstUiDocUrl } from "@/lib/ui/get-first-ui-doc-url";
import { ComponentsRouteLayout } from "./components-route-layout";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navItems = getComponentGalleryItems();
  const primitivesUrl = getFirstPrimitiveDocUrl();
  const releaseDatesByUrl = getReleaseDatesByUrl();
  const tree = source.pageTree;
  const uiUrl = getFirstUiDocUrl();

  return (
    <ComponentsRouteLayout
      navItems={navItems}
      primitivesUrl={primitivesUrl}
      releaseDatesByUrl={releaseDatesByUrl}
      tree={tree}
      uiUrl={uiUrl}
    >
      {children}
    </ComponentsRouteLayout>
  );
}
