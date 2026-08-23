"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import {
  ScrollGallery,
  type ScrollGallerySlide,
} from "@/registry/primitives/effects/scroll-gallery";

const SCROLL_GALLERY_MEDIA =
  "https://cdn.soralabs.studio/media/demo/scroll-gallery" as const;

export const scrollGalleryDemoSlides: ScrollGallerySlide[] = [
  {
    title: "Room 14B",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-1.webp`,
    url: "#",
  },
  {
    title: "Subject Identified",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-2.webp`,
    url: "#",
  },
  {
    title: "Dossier 09",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-3.webp`,
    url: "#",
  },
  {
    title: "Stairwell C7",
    image: `${SCROLL_GALLERY_MEDIA}/featured-work-4.webp`,
    url: "#",
  },
];

export default function ScrollGalleryDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<Element | Window | undefined>();

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    const resolved = resolveScrollRoot(node);

    waitForScrollerReady(resolved)
      .then(() => {
        setScroller(resolved);
      })
      .catch(() => {
        /* preview unmounted */
      });
  }, []);

  return (
    <div className="w-full" ref={rootRef}>
      <CatalogScrollHint label="Scroll to reveal slides" />

      {scroller ? (
        <ScrollGallery
          containerQuery
          embedded
          linkLabel="Explore"
          prefixLabel="Featured"
          scroller={scroller}
          slides={scrollGalleryDemoSlides}
          variant="studio"
        />
      ) : null}
    </div>
  );
}
