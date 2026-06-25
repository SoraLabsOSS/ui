"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { TextRevealBox } from "@/registry/primitives/texts/text-reveal-box";

const PARAGRAPHS = [
  "We work at the intersection of systems design and psychological tension. Every project ships only when the player feels watched from the first frame and never fully shakes it after the last.",
];

function resolveCatalogScroller(node: HTMLElement): Element | Window {
  const previewScroller = node.closest("[data-radix-scroll-area-viewport]");
  if (previewScroller) {
    return previewScroller;
  }

  const pageScroller = node.closest("[data-catalog-scroll-root]");
  if (pageScroller instanceof HTMLElement) {
    return pageScroller;
  }

  return window;
}

export default function TextRevealBoxExample() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<Element | Window | null>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    setScroller(resolveCatalogScroller(node));
  }, []);

  return (
    <div className="w-full" ref={rootRef}>
      <CatalogScrollHint label="Scroll to reveal text word by word" />

      <TextRevealBox
        containerClassName="w-[90%] max-w-2xl"
        embedded
        paragraphClassName="text-center text-2xl font-medium leading-tight tracking-tight md:text-3xl"
        paragraphs={PARAGRAPHS}
        pinDuration={4}
        scroller={scroller ?? undefined}
      />
    </div>
  );
}
