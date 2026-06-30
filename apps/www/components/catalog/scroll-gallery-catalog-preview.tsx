"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import {
  SCROLL_GALLERY_STUDIO_CLASSES,
  ScrollGallery,
} from "@/registry/primitives/effects/scroll-gallery";

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

export default function ScrollGalleryCatalogPreview() {
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
      <CatalogScrollHint label="Scroll inside the preview to scrub slides" />
      {scroller ? (
        <ScrollGallery
          containerQuery
          embedded
          imageClassName={SCROLL_GALLERY_STUDIO_CLASSES.image}
          imageFrameClassName={SCROLL_GALLERY_STUDIO_CLASSES.imageFrame}
          imagesClassName={SCROLL_GALLERY_STUDIO_CLASSES.images}
          infoClassName={SCROLL_GALLERY_STUDIO_CLASSES.info}
          infoInnerClassName={SCROLL_GALLERY_STUDIO_CLASSES.infoInner}
          linkClassName={SCROLL_GALLERY_STUDIO_CLASSES.link}
          linkLabel="Explore"
          linkTextClassName={SCROLL_GALLERY_STUDIO_CLASSES.linkText}
          prefixClassName={SCROLL_GALLERY_STUDIO_CLASSES.prefix}
          prefixLabel="Featured"
          prefixTextClassName={SCROLL_GALLERY_STUDIO_CLASSES.prefixText}
          scroller={scroller}
          slides={DEMO_SLIDES}
          titleClassName={SCROLL_GALLERY_STUDIO_CLASSES.title}
          titleTextClassName={SCROLL_GALLERY_STUDIO_CLASSES.titleText}
        />
      ) : null}
    </div>
  );
}
