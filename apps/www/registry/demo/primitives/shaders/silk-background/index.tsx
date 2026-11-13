"use client";

import { SilkBackground } from "@/registry/primitives/shaders/silk-background";

export function SilkBackgroundDemo() {
  return (
    <div className="border-border/50 relative flex h-95 w-full items-center justify-center overflow-hidden rounded-2xl border bg-black/40 shadow-2xl">
      <SilkBackground className="absolute inset-0" />
    </div>
  );
}
