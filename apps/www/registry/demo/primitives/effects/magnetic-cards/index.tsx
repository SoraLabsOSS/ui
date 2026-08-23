"use client";

import {
  MagneticCards,
  type MagneticCardsItem,
} from "@/registry/primitives/effects/magnetic-cards";

const MAGNETIC_CARDS_MEDIA =
  "https://cdn.soralabs.studio/media/demo/magnetic-cards" as const;

const DEMO_ITEMS: MagneticCardsItem[] = [
  { alt: "Magnetic cards demo 1", src: `${MAGNETIC_CARDS_MEDIA}/item1.avif` },
  { alt: "Magnetic cards demo 2", src: `${MAGNETIC_CARDS_MEDIA}/item2.avif` },
  { alt: "Magnetic cards demo 3", src: `${MAGNETIC_CARDS_MEDIA}/item3.avif` },
  { alt: "Magnetic cards demo 4", src: `${MAGNETIC_CARDS_MEDIA}/item4.avif` },
];

export function MagneticCardsExample() {
  return (
    <div className="h-[min(420px,60dvh)] w-full min-w-0 sm:h-[460px]">
      <MagneticCards className="h-full w-full" items={DEMO_ITEMS} />
    </div>
  );
}

export default MagneticCardsExample;
