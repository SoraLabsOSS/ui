"use client";

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

export function StickyScrollCardsDemoPage() {
  return (
    <StickyScrollCards
      cards={CARDS}
      front={FRONT}
      headline="Scroll to pin, flip, and let go"
      refreshPriority={-3}
      variant="studio"
    />
  );
}
