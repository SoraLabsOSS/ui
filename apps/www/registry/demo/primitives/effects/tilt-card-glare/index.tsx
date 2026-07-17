"use client";

import { TiltCard } from "@/registry/primitives/effects/tilt-card";

export interface TiltCardGlareDemoProps {
  glareMaxOpacity?: number;
  rotationFactor?: number;
}

export function TiltCardGlareDemo({
  glareMaxOpacity = 0.05,
  rotationFactor = 15,
}: TiltCardGlareDemoProps) {
  return (
    <TiltCard
      className="w-[280px] overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 p-6"
      glare
      glareMaxOpacity={glareMaxOpacity}
      rotationFactor={rotationFactor}
    >
      <div
        className="flex flex-col gap-3"
        style={{ transform: "translateZ(40px)" }}
      >
        <p className="font-medium text-sm text-zinc-50">Glare</p>
        <p className="text-sm text-zinc-400">
          A light reflection sweeps across the surface as the card tilts,
          selling the material.
        </p>
      </div>
    </TiltCard>
  );
}

export default TiltCardGlareDemo;
