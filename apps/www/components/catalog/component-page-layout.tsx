import type { ReactNode } from "react";
import type { NeighborNavItem } from "@/components/docs/neighbor-nav-buttons";
import type {
  ComponentGalleryItem,
  ComponentPageData,
  ComponentPageHeaderData,
} from "@/lib/registry/types";
import { ComponentPageLayoutClient } from "./component-page-layout-client";

interface ComponentPageLayoutProps {
  children: ReactNode;
  data: ComponentPageData;
  githubPath: string;
  header: ComponentPageHeaderData;
  navItems: ComponentGalleryItem[];
  nextNav?: NeighborNavItem;
  previousNav?: NeighborNavItem;
  releaseDate?: string;
}

export function ComponentPageLayout({
  children,
  data,
  header,
  githubPath,
  navItems,
  nextNav,
  previousNav,
  releaseDate,
}: ComponentPageLayoutProps) {
  return (
    <ComponentPageLayoutClient
      githubPath={githubPath}
      header={header}
      key={data.previewName}
      navItems={navItems}
      nextNav={nextNav}
      previewName={data.previewName}
      previousNav={previousNav}
      registryName={data.registryName}
      releaseDate={releaseDate}
      toc={data.toc}
    >
      {children}
    </ComponentPageLayoutClient>
  );
}
