"use client";

import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { CursorTrailReveal } from "@/registry/catalog/cursor-trail-reveal";

import { DEMO_TRAIL_IMAGES } from "./trail-images";

export function CursorTrailRevealExample() {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-start overflow-hidden pt-12 sm:pt-16">
      <CatalogScrollHint
        className="pointer-events-none relative z-[1] my-0 select-none"
        label="Move cursor to reveal trail"
      />

      <CursorTrailReveal
        desktopBreakpoint={0}
        images={DEMO_TRAIL_IMAGES}
        maskColor="#1a1a1a"
      />
    </div>
  );
}

export default CursorTrailRevealExample;
