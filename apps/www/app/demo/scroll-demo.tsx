"use client";

import { TextRevealBox } from "@/registry/primitives/texts/text-reveal-box";

const PARAGRAPHS = [
  "Deadlock Studios is a design-led game studio that operates at the edge of comfort. We make experiences for people who want to be unsettled, challenged, and held in place by worlds that feel more real than they should.",
  "We work at the intersection of systems design and psychological tension. Every project ships only when the player feels watched from the first frame and never fully shakes it after the last.",
];

const KEYWORDS: string[] = [];
const KEYWORD_COLORS: Record<string, string> = {};

export function ScrollDemoPage() {
  return (
    <div className="text-reveal-box-root">
      <TextRevealBox
        highlightBg="60, 60, 60"
        keywordColors={KEYWORD_COLORS}
        keywords={KEYWORDS}
        paragraphs={PARAGRAPHS}
        pinDuration={4}
      />
    </div>
  );
}
