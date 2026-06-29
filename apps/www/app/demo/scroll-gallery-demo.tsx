"use client";

import { SCROLL_GALLERY_STUDIO_CLASSES as studio } from "@/components/catalog/scroll-gallery-catalog-preview";
import { ScrollGallery } from "@/registry/primitives/effects/scroll-gallery";

const DEMO_SLIDES = [
  {
    title: "Room 14B",
    image: "/featured-work/featured-work-1.jpg",
    url: "#",
  },
  {
    title: "Subject Identified",
    image: "/featured-work/featured-work-2.jpg",
    url: "#",
  },
  {
    title: "Dossier 09",
    image: "/featured-work/featured-work-3.jpg",
    url: "#",
  },
  {
    title: "Stairwell C7",
    image: "/featured-work/featured-work-4.jpg",
    url: "#",
  },
];

export function ScrollGalleryDemoPage() {
  return (
    <ScrollGallery
      className="relative h-svh w-full overflow-hidden max-lg:h-dvh"
      imageClassName={studio.image}
      imageFrameClassName={studio.imageFrame}
      imagesClassName={studio.images}
      infoClassName={studio.info}
      infoInnerClassName={studio.infoInner}
      linkClassName={studio.link}
      linkLabel="Explore"
      linkTextClassName={studio.linkText}
      prefixClassName={studio.prefix}
      prefixLabel="Featured"
      prefixTextClassName={studio.prefixText}
      scrollPerTransition={1000}
      slides={DEMO_SLIDES}
      titleClassName={studio.title}
      titleTextClassName={studio.titleText}
    />
  );
}
