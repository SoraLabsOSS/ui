"use client";

import type { PageTree } from "fumadocs-core/server";
import { useSidebar } from "fumadocs-ui/provider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { ComponentPageBlocksShell } from "@/components/blocks/blocks-shell";
import { ComponentsShell } from "@/components/blocks/components-shell";
import type { ComponentGalleryItem } from "@/lib/registry/types";

import { ComponentsGalleryLayout } from "./components-gallery-layout";

function releaseBlocksDocumentScroll() {
  document.documentElement.classList.remove("blocks-scroll-lock");
  document.body.style.removeProperty("overflow");
  delete document.documentElement.dataset.blocksMenuOpen;
}

interface ComponentsRouteLayoutProps {
  children: ReactNode;
  navItems: ComponentGalleryItem[];
  primitivesUrl: string;
  releaseDatesByUrl: Record<string, string>;
  tree: PageTree.Root;
  uiUrl: string;
}

export function ComponentsRouteLayout({
  children,
  navItems,
  primitivesUrl,
  releaseDatesByUrl,
  tree,
  uiUrl,
}: ComponentsRouteLayoutProps) {
  const pathname = usePathname();
  const isGalleryIndex = pathname === "/blocks" || pathname === "/components";
  const { setOpen: setSidebarOpen } = useSidebar();

  useEffect(
    () => () => {
      setSidebarOpen(false);
      releaseBlocksDocumentScroll();
    },
    [setSidebarOpen]
  );

  if (isGalleryIndex) {
    return (
      <ComponentsGalleryLayout
        primitivesUrl={primitivesUrl}
        releaseDatesByUrl={releaseDatesByUrl}
        tree={tree}
        uiUrl={uiUrl}
      >
        {children}
      </ComponentsGalleryLayout>
    );
  }

  return (
    <ComponentsShell>
      <ComponentPageBlocksShell navItems={navItems}>
        {children}
      </ComponentPageBlocksShell>
    </ComponentsShell>
  );
}
