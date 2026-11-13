"use client";

import { SilkBackground } from "@/registry/primitives/shaders/silk-background";

export interface SilkBackgroundDemoProps {
  highlightColor?: string;
  noise?: number;
  scale?: number;
  shadowColor?: string;
  speed?: number;
}

export const SilkBackgroundDemo = ({
  scale = 1.1,
  noise = 1,
  speed = 0.5,
  shadowColor = "#131316",
  highlightColor = "#3a1220",
}: SilkBackgroundDemoProps) => (
  <div className="border-border/50 relative flex h-95 w-full items-center justify-center overflow-hidden rounded-2xl border bg-black/40 shadow-2xl">
    <SilkBackground
      className="absolute inset-0"
      highlightColor={highlightColor}
      noise={noise}
      scale={scale}
      shadowColor={shadowColor}
      speed={speed}
    />
  </div>
);
