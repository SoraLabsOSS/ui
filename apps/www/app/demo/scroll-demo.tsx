"use client";

import { TextRevealBox } from "@/registry/primitives/texts/text-reveal-box";

const PARAGRAPHS = [
  "Sora UI is a motion-first registry for React and Next.js. Copy-paste primitives built on Motion and GSAP.",
  "You own the source. Tune timing, swap tokens, ship animation that feels intentional.",
];

const KEYWORDS: string[] = [];
const KEYWORD_COLORS: Record<string, string> = {};

export function ScrollDemoPage() {
  return (
    <TextRevealBox
      highlightBg="60, 60, 60"
      keywordColors={KEYWORD_COLORS}
      keywords={KEYWORDS}
      paragraphs={PARAGRAPHS}
      pinDuration={4}
      refreshPriority={-2}
      variant="studio"
    />
  );
}
