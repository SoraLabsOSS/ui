import type { MagneticCardsItem } from "@/registry/primitives/effects/magnetic-cards";

const MAGNETIC_CARDS_MEDIA =
  "https://sora.axyl.io.vn/media/demo/magnetic-cards" as const;

export const magneticCardsDemoItems: MagneticCardsItem[] = [
  { alt: "Magnetic cards demo 1", src: `${MAGNETIC_CARDS_MEDIA}/item1.avif` },
  { alt: "Magnetic cards demo 2", src: `${MAGNETIC_CARDS_MEDIA}/item2.avif` },
  { alt: "Magnetic cards demo 3", src: `${MAGNETIC_CARDS_MEDIA}/item3.avif` },
  { alt: "Magnetic cards demo 4", src: `${MAGNETIC_CARDS_MEDIA}/item4.avif` },
];
