"use client";

import { cn } from "@workspace/ui/lib/utils";
import { catalogPreviewScreenClassName } from "@/components/catalog/catalog-preview-classes";
import { CursorTrailReveal } from "@/registry/primitives/effects/cursor-trail-reveal";
import { TextRevealBlock } from "@/registry/primitives/texts/text-reveal-block";

import { DEMO_TRAIL_IMAGES } from "./trail-images";

export function CursorTrailRevealExample() {
  return (
    <div
      className={cn("relative overflow-hidden", catalogPreviewScreenClassName)}
    >
      <CursorTrailReveal images={DEMO_TRAIL_IMAGES} maskColor="#1a1a1a" />

      <div className="absolute inset-0 z-1 flex items-center justify-center">
        <div className="mx-auto flex w-3/4 flex-col items-center gap-8 text-center max-lg:w-[90%]">
          <TextRevealBlock
            animateOnScroll={false}
            blockColor="#c8e600"
            delay={0.65}
          >
            <div className="flex w-full flex-col items-center">
              <h6 className="m-0 font-medium text-[2.5rem] uppercase leading-none tracking-[-0.05rem] max-lg:text-[1.75rem]">
                Move your cursor to reveal the trail
              </h6>
            </div>
          </TextRevealBlock>
        </div>
      </div>
    </div>
  );
}

export default CursorTrailRevealExample;
