"use client";

import { PARTNER_LOGO_CAROUSEL_ROWS } from "@/lib/partner-logos";
import {
  LogoCarouselSwapper,
  type LogoCarouselSwapperProps,
} from "@/registry/primitives/effects/logo-carousel-swapper";

export function LogoCarouselSwapperExample({
  monochrome = true,
}: Pick<LogoCarouselSwapperProps, "monochrome">) {
  return (
    <div className="flex w-full max-w-full items-center justify-center overflow-hidden px-2 sm:px-4">
      <LogoCarouselSwapper
        aria-label="Partner logos"
        className="max-w-3xl"
        interval={3000}
        monochrome={monochrome}
        rows={PARTNER_LOGO_CAROUSEL_ROWS}
        stagger={0.12}
      />
    </div>
  );
}
