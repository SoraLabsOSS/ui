"use client";

import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { TextRevealBox } from "@/registry/primitives/texts/text-reveal-box";

const PARAGRAPHS = [
  "We work at the intersection of systems design and psychological tension. Every project ships only when the player feels watched from the first frame and never fully shakes it after the last.",
];

const KEYWORDS: string[] = [];
const KEYWORD_COLORS: Record<string, string> = {};

export default function TextRevealBoxExample() {
  return (
    <div className="w-full">
      <CatalogScrollHint label="Scroll to reveal text word by word" />

      <div className="w-full text-reveal-box-catalog text-reveal-box-root">
        <TextRevealBox
          keywordColors={KEYWORD_COLORS}
          keywords={KEYWORDS}
          paragraphs={PARAGRAPHS}
          pinDuration={4}
        />
      </div>
    </div>
  );
}
