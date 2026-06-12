import type { Metadata } from "next";
import { CatalogScrollArea } from "@/components/catalog/catalog-scroll-area";
import { ComponentGallery } from "@/components/catalog/component-gallery";
import { ComponentPageCatalogMenuButton } from "@/components/catalog/component-page-catalog-menu-button";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";

const title = "Components";
const description =
  "Browse Sora UI components with live previews, installation commands, and API reference.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: getOgMetadataImages(["components"], title),
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: getTwitterMetadataImages(["components"]),
  },
};

export default function ComponentsPage() {
  const items = getComponentGalleryItems();

  return (
    <CatalogScrollArea className="h-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 md:px-12 md:py-14">
        <header className="mb-10 flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-3">
            <ComponentPageCatalogMenuButton />
            <p className="font-medium text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]">
              Registry
            </p>
          </div>
          <h1 className="font-medium text-4xl tracking-tighter md:text-5xl">
            Components
          </h1>
          <p className="text-base text-foreground/55 leading-relaxed md:text-lg">
            Preview-first component pages with live demos, install commands, and
            full API reference.
          </p>
        </header>

        <ComponentGallery items={items} />
      </div>
    </CatalogScrollArea>
  );
}
