"use client";

import { scrollGalleryDemoSlides } from "@/lib/demo/scroll-gallery-demo-slides";
import { ScrollGallery } from "@/registry/primitives/effects/scroll-gallery";

/** Primitive defaults only — no Studio / Deadlock class overrides. */
export function ScrollGalleryBasicDemoPage() {
  return <ScrollGallery slides={scrollGalleryDemoSlides} />;
}
