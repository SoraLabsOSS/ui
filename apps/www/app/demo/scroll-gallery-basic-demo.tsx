"use client";

import { ScrollGallery } from "@/registry/primitives/effects/scroll-gallery";

const BASIC_SLIDES = [
  {
    title: "Room 14B",
    image: "/featured-work/featured-work-1.jpg",
    url: "#",
  },
  {
    title: "Subject Identified",
    image: "/featured-work/featured-work-2.jpg",
    url: "#",
  },
  {
    title: "Dossier 09",
    image: "/featured-work/featured-work-3.jpg",
    url: "#",
  },
  {
    title: "Stairwell C7",
    image: "/featured-work/featured-work-4.jpg",
    url: "#",
  },
];

/** Primitive defaults only — no Studio / Deadlock class overrides. */
export function ScrollGalleryBasicDemoPage() {
  return <ScrollGallery slides={BASIC_SLIDES} />;
}
