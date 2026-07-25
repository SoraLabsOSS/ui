"use client";

import { heroCarouselDemoImages } from "@/lib/demo/hero-carousel-demo-images";
import { HeroCarousel } from "@/registry/primitives/effects/hero-carousel";

export function HeroCarouselExample() {
  return (
    <div className="w-full max-w-xl px-2 sm:px-4">
      <HeroCarousel
        images={heroCarouselDemoImages}
        initialIndex={0}
        intervalMs={4500}
      />
    </div>
  );
}

export default HeroCarouselExample;
