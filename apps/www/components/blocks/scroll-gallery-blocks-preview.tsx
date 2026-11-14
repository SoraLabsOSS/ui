"use client";

import { useEffect, useRef, useState } from "react";

import { BlocksScrollHint } from "@/components/blocks/blocks-scroll-hint";
import { resolveScrollRoot } from "@/lib/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroller-ready";
import { ScrollGallery } from "@/registry/blocks/scroll-gallery";
import { scrollGalleryDemoSlides } from "@/registry/demo/blocks/scroll-gallery";

export default function ScrollGalleryBlocksPreview() {
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
      <BlocksScrollHint label="Scroll inside the preview to scrub slides" />
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
