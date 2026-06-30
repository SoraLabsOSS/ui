"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { scrollGalleryDemoSlides } from "@/lib/demo/scroll-gallery-demo-slides";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import {
  ScrollGallery,
  SCROLL_GALLERY_STUDIO_CLASSES as studio,
} from "@/registry/primitives/effects/scroll-gallery";

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
          className={studio.root}
          containerQuery
          embedded
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
          scroller={scroller}
          slides={scrollGalleryDemoSlides}
          titleClassName={studio.title}
          titleTextClassName={studio.titleText}
        />
      ) : null}
    </div>
  );
}
