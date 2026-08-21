"use client";

import { TiltCard } from "@/registry/primitives/effects/tilt-card";

export interface TiltCardDemoProps {
  glare?: boolean;
  isReverse?: boolean;
  perspective?: number;
  rotationFactor?: number;
  scaleOnHover?: number;
}

export function TiltCardDemo({
  glare = true,
  isReverse = false,
  perspective = 1000,
  rotationFactor = 15,
  scaleOnHover = 1.02,
}: TiltCardDemoProps) {
  return (
    <TiltCard
      className="w-[280px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
      glare={glare}
      isReverse={isReverse}
      perspective={perspective}
      rotationFactor={rotationFactor}
      scaleOnHover={scaleOnHover}
    >
      <div
        className="flex flex-col gap-3"
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
        <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
          Sora UI
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Move your cursor around — the card tilts toward it on a spring, and
          this content floats above the surface.
        </p>
      </div>
    </TiltCard>
  );
}

export default TiltCardDemo;
