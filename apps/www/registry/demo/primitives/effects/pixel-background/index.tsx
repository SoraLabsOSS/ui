"use client";

import {
  type AnimationPattern,
  PixelBackground,
} from "@/registry/primitives/effects/pixel-background";

export function PixelBackgroundExample({
  colors = "#f8fafc,#f1f5f9,#cbd5e1",
  pattern = "center",
  gap = 5,
  speed = 35,
  pixelOpacity = 1,
}: {
  colors?: string;
  gap?: number;
  pattern?: AnimationPattern;
  pixelOpacity?: number;
  speed?: number;
}) {
  return (
    <div className="h-[min(420px,60dvh)] w-full min-w-0 sm:h-[420px]">
      <PixelBackground
        className="h-full w-full"
        colors={colors}
        gap={gap}
        pattern={pattern}
        pixelOpacity={pixelOpacity}
        speed={speed}
      >
        <div className="flex h-full w-full items-center justify-center">
          <p className="font-medium text-lg">Hover me</p>
        </div>
      </PixelBackground>
    </div>
  );
}

export default PixelBackgroundExample;
