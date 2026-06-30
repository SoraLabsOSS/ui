"use client";

import { scrollGalleryDemoSlides } from "@/lib/demo/scroll-gallery-demo-slides";
import {
  ScrollGallery,
  SCROLL_GALLERY_STUDIO_CLASSES as studio,
} from "@/registry/primitives/effects/scroll-gallery";

export default function ScrollGalleryDemo() {
  return (
    <ScrollGallery
      className={studio.root}
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
      slides={scrollGalleryDemoSlides}
      titleClassName={studio.title}
      titleTextClassName={studio.titleText}
    />
  );
}
