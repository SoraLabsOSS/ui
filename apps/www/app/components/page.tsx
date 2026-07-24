import type { Metadata } from "next";
import { CatalogScrollArea } from "@/components/catalog/catalog-scroll-area";
import { ComponentGalleryExplorer } from "@/components/catalog/component-gallery-explorer";
import { ComponentsGalleryHero } from "@/components/catalog/components-gallery-hero";
import { pageContentCacheLife } from "@/lib/cache/page-content-cache-life";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-metadata-images";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";
import { getPageAlternates } from "@/lib/site";

const title = "Components";
const description =
  "Preview-first component pages with live demos, install commands, and full API reference.";

export const metadata: Metadata = {
  title,
  description,
  alternates: getPageAlternates("/components"),
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

export default async function ComponentsPage() {
  return <CachedComponentsGallery />;
}

async function CachedComponentsGallery() {
  "use cache";
  pageContentCacheLife();

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
