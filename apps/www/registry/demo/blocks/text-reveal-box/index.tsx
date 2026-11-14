"use client";

import { useEffect, useRef, useState } from "react";

import { BlocksScrollHint } from "@/components/blocks/blocks-scroll-hint";
import { resolveScrollRoot } from "@/lib/resolve-scroll-root";
import { waitForScrollerReady } from "@/lib/scroller-ready";
import { TextRevealBox } from "@/registry/blocks/text-reveal-box";

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
      <BlocksScrollHint label="Scroll to reveal text word by word" />

      {scroller ? (
        <TextRevealBox
          classNames={{
            paragraph:
              "text-[clamp(1.5rem,2.5vw,4.5rem)] font-medium leading-none tracking-[-0.02em]",
          }}
          containerQuery
          embedded
          paragraphs={PARAGRAPHS}
          pinDuration={4}
          scroller={scroller}
          variant="minimal"
        />
      ) : null}
    </div>
  );
}
