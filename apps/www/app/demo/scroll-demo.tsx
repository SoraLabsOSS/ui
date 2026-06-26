"use client";

import { useEffect, useState } from "react";
import {
  TEXT_REVEAL_BOX_STUDIO_CLASSES as studio,
  TextRevealBox,
} from "@/registry/primitives/texts/text-reveal-box";

import { DEMO_PAGE_ID } from "./demo-lenis";

const PARAGRAPHS = [
  "Sora UI is a motion-first registry for React and Next.js. Copy-paste primitives built on Motion and GSAP.",
  "You own the source. Tune timing, swap tokens, ship animation that feels intentional.",
];

const KEYWORDS: string[] = [];
const KEYWORD_COLORS: Record<string, string> = {};

export function ScrollDemoPage() {
  const [scroller, setScroller] = useState<Element | undefined>();

  useEffect(() => {
    const node = document.getElementById(DEMO_PAGE_ID);
    if (node) {
      setScroller(node);
    }
  }, []);

  return (
    <TextRevealBox
      className={studio.root}
      containerClassName={studio.container}
      highlightBg="60, 60, 60"
      keywordClassName={studio.keyword}
      keywordColors={KEYWORD_COLORS}
      keywords={KEYWORDS}
      keywordWrapperClassName={studio.keywordWrapper}
      paragraphClassName={studio.paragraph}
      paragraphs={PARAGRAPHS}
      pinDuration={4}
      scroller={scroller}
      stickyClassName={studio.sticky}
      wordClassName={studio.word}
    />
  );
}
