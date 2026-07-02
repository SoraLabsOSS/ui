"use client";

import { scrollGalleryDemoSlides } from "@/lib/demo/scroll-gallery-demo-slides";
import { ScrollGallery } from "@/registry/primitives/effects/scroll-gallery";

export function ScrollGalleryDemoPage() {
  return (
    <ScrollGallery
      linkLabel="Explore"
      prefixLabel="Featured"
      refreshPriority={-1}
      scrollPerTransition={1000}
      slides={scrollGalleryDemoSlides}
      variant="studio"
    />
  );
}
