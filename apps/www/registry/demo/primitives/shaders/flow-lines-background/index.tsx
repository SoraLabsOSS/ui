"use client";

import { FlowLinesBackground } from "@/registry/primitives/shaders/flow-lines-background";

export interface FlowLinesBackgroundDemoProps {
  darkColor?: string;
  lightColor?: string;
  midColor?: string;
}

export const FlowLinesBackgroundDemo = ({
  lightColor = "#3f3f3f",
  midColor = "#262626",
  darkColor = "#09050c",
}: FlowLinesBackgroundDemoProps) => (
  <div className="border-border/50 relative flex h-95 w-full items-center justify-center overflow-hidden rounded-2xl border bg-black/40 shadow-2xl">
    <FlowLinesBackground
      className="absolute inset-0"
      darkColor={darkColor}
      lightColor={lightColor}
      midColor={midColor}
    />
  </div>
);
