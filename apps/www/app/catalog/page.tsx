import type { Metadata } from "next";
import { CatalogScrollArea } from "@/components/catalog/catalog-scroll-area";
import { ComponentGalleryExplorer } from "@/components/catalog/component-gallery-explorer";
import { ComponentsGalleryHero } from "@/components/catalog/components-gallery-hero";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";
import { getPageAlternates } from "@/lib/site";

const title = "Catalog";
const description =
  "Preview-first layout showcases and interactive components with live demos, install commands, and full API reference.";

export const metadata: Metadata = {
  title,
  description,
  alternates: getPageAlternates("/catalog"),
  openGraph: {
    title,
    description,
    images: getOgMetadataImages(["catalog"], title),
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: getTwitterMetadataImages(["catalog"]),
  },
};

export default async function CatalogPage() {
  return <ComponentsGallery />;
}

async function ComponentsGallery() {
  const items = getComponentGalleryItems();

  return (
    <CatalogScrollArea className="h-full min-h-0 flex-1">
      <div className="relative flex flex-col items-center overflow-visible px-6 lg:px-10">
        <div className="relative z-10 flex w-full max-w-7xl flex-col items-center justify-center pt-24 md:pt-32 lg:pt-40">
          <ComponentsGalleryHero />
        </div>

        <ComponentGalleryExplorer items={items} />
      </div>
    </CatalogScrollArea>
  );
}
