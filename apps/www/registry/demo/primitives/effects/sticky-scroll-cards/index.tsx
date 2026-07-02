"use client";

import { useEffect, useRef, useState } from "react";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { resolveScrollRoot } from "@/lib/catalog/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroll/scroller-ready";
import { StickyScrollCards } from "@/registry/primitives/effects/sticky-scroll-cards";

const FRONT = {
  title: "First Frame",
  description:
    "A single moment, held in place before everything begins to move.",
};

const CARDS = [
  {
    title: "Final Hold",
    description:
      "Everything settles into place, leaving a lasting frame that feels complete.",
  },
  {
    title: "Layered Time",
    description:
      "Moments stack, overlap, and reveal themselves slowly as the scroll continues.",
  },
  {
    title: "Weight & Flow",
    description:
      "Elements carry presence, easing in and out with balance, never rushed, never still.",
  },
  {
    title: "Soft Motion",
    description:
      "Subtle shifts and gentle transitions that build a quiet sense of rhythm as you move forward.",
  },
];

export default function StickyScrollCardsExample() {
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
      <CatalogScrollHint label="Scroll to flip and dismiss cards" />

      {scroller ? (
        <StickyScrollCards
          cards={CARDS}
          containerQuery
          embedded
          front={FRONT}
          headline="Scroll to pin, flip, and let go"
          scroller={scroller}
          timing={{
            cardDismissDuration: 70,
            cardFlipTrigger: 140,
            cardsEnterEnd: 70,
            dismissStart: 210,
          }}
          variant="studio"
        />
      ) : null}
    </div>
  );
}
