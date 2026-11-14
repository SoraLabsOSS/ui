import type { Metadata } from "next";

import { BlocksScrollArea } from "@/components/blocks/blocks-scroll-area";
import { ComponentGalleryExplorer } from "@/components/blocks/gallery/component-gallery-explorer";
import { ComponentsGalleryHero } from "@/components/blocks/gallery/components-gallery-hero";
import {
  getOgMetadataImages,
  getTwitterMetadataImages,
} from "@/lib/og/og-paths";
import { getComponentGalleryItems } from "@/lib/registry/get-component-page-data";
import { getPageAlternates } from "@/lib/site";

const title = "Blocks";
const description =
  "Preview-first layout showcases and interactive components with live demos, install commands, and full API reference.";

export const metadata: Metadata = {
  title,
  description,
  alternates: getPageAlternates("/blocks"),
  openGraph: {
    title,
    description,
    images: getOgMetadataImages(["blocks"], title),
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: getTwitterMetadataImages(["blocks"]),
  },
};

export default async function BlocksPage() {
  return <ComponentsGallery />;
}

async function ComponentsGallery() {
  const items = getComponentGalleryItems();

  return (
    <BlocksScrollArea className="h-full min-h-0 flex-1">
      <div className="relative flex flex-col items-center overflow-visible px-6 lg:px-10">
        <div className="relative z-10 flex w-full flex-col items-center justify-center pt-24 md:pt-32 lg:pt-40">
          <ComponentsGalleryHero />
        </div>

        <ComponentGalleryExplorer items={items} />
      </div>
    </BlocksScrollArea>
  );
}
