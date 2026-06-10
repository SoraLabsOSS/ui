import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/docs/source";
import type { ComponentDocPage } from "@/lib/registry/component-source";

export type PrimitiveDocPage = InferPageType<typeof source>;

export type ComponentCollection = "component" | "block" | "showcase";

export interface RegistryInspiration {
  label: string;
  type: "inspired" | "reimplemented" | "adapted";
  url: string;
}

export interface ComponentTocItem {
  depth: number;
  title: string;
  url: string;
}

export interface ComponentPageData {
  collection: ComponentCollection;
  componentUrl: string;
  dependencies: string[];
  docsUrl: string;
  installCommand: string;
  page: ComponentDocPage;
  previewName: string;
  registryDependencies: string[];
  registryName: string;
  slug: string;
  toc: ComponentTocItem[];
}

export interface ComponentPageHeaderData {
  author?: {
    name: string;
    url?: string;
  };
  collection: ComponentCollection;
  componentUrl: string;
  dependencies: string[];
  description: string;
  docsUrl: string;
  registryDependencies: string[];
  title: string;
}

export interface ComponentGalleryItem {
  collection: ComponentCollection;
  description: string;
  href: string;
  releaseDate?: string;
  slug: string;
  title: string;
}
