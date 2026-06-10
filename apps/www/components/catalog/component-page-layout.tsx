import type { ReactNode } from "react";
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
  releaseDate?: string;
}

export function ComponentPageLayout({
  children,
  data,
  header,
  githubPath,
  navItems,
  releaseDate,
}: ComponentPageLayoutProps) {
  return (
    <ComponentPageLayoutClient
      githubPath={githubPath}
      header={header}
      key={data.previewName}
      navItems={navItems}
      previewName={data.previewName}
      registryName={data.registryName}
      releaseDate={releaseDate}
      toc={data.toc}
    >
      {children}
    </ComponentPageLayoutClient>
  );
}
