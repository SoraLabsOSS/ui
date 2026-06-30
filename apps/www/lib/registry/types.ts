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
  docsUrl: string;
  page: ComponentDocPage;
  previewName: string;
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
  description: string;
  docsUrl: string;
  title: string;
}

export type ComponentGalleryCategory =
  | "texts"
  | "buttons"
  | "effects"
  | "disclosure"
  | "components";

export interface ComponentGalleryCardPreview {
  poster?: string;
  videoMp4?: string;
  videoWebm?: string;
}

export interface ComponentGalleryItem {
  /** Poster + optional hover video sources for gallery cards. */
  cardPreview?: ComponentGalleryCardPreview;
  category?: ComponentGalleryCategory;
  collection: ComponentCollection;
  description: string;
  href: string;
  /** @deprecated Use `cardPreview.videoMp4` instead. */
  previewVideo?: string;
  releaseDate?: string;
  slug: string;
  title: string;
}
