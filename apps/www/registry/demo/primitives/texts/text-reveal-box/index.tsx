"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import { TextRevealBox } from "@/registry/primitives/texts/text-reveal-box";

const PARAGRAPHS = [
  "We work at the intersection of systems design and psychological tension. Every project ships only when the player feels watched from the first frame and never fully shakes it after the last.",
];

export default function TextRevealBoxExample() {
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
      <CatalogScrollHint label="Scroll to reveal text word by word" />

      {scroller ? (
        <TextRevealBox
          containerClassName="w-[90%] max-w-2xl"
          containerQuery
          embedded
          paragraphClassName="text-center text-2xl font-medium leading-tight tracking-tight md:text-3xl"
          paragraphs={PARAGRAPHS}
          pinDuration={4}
          scroller={scroller}
        />
      ) : null}
    </div>
  );
}
