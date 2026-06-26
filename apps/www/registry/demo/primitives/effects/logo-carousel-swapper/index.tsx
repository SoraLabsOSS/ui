"use client";

import { PARTNER_LOGO_CAROUSEL_ROWS } from "@/lib/partner-logos";
import { LogoCarouselSwapper } from "@/registry/primitives/effects/logo-carousel-swapper";

export function LogoCarouselSwapperExample() {
  return (
    <div className="flex w-full items-center justify-center overflow-visible px-4">
      <LogoCarouselSwapper
        aria-label="Partner logos"
        className="max-w-3xl"
        interval={3000}
        monochrome
        rows={PARTNER_LOGO_CAROUSEL_ROWS}
        stagger={0.12}
      />
    </div>
  );
}
