"use client";

import { cn } from "@workspace/ui/lib/utils";
import { catalogPreviewScreenClassName } from "@/components/catalog/catalog-preview-classes";
import { CatalogScrollHint } from "@/components/catalog/catalog-scroll-hint";
import { CursorTrailReveal } from "@/registry/catalog/cursor-trail-reveal";

import { DEMO_TRAIL_IMAGES } from "./trail-images";

export function CursorTrailRevealExample() {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        catalogPreviewScreenClassName
      )}
    >
      <CursorTrailReveal
        desktopBreakpoint={0}
        images={DEMO_TRAIL_IMAGES}
        maskColor="#1a1a1a"
      />

      <div className="pointer-events-none relative z-1 flex items-center justify-center">
        <CatalogScrollHint label="Move cursor to reveal trail" />
      </div>
    </div>
  );
}

export default CursorTrailRevealExample;
