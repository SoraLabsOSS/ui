"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import { scrollGalleryDemoSlides } from "@/registry/demo/primitives/effects/scroll-gallery";
import { ScrollGallery } from "@/registry/primitives/effects/scroll-gallery";

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
