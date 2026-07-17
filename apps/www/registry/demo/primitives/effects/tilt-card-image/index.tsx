"use client";

import Image from "next/image";
import { TiltCard } from "@/registry/primitives/effects/tilt-card";

export interface TiltCardImageDemoProps {
  isReverse?: boolean;
  rotationFactor?: number;
}

/** motion-primitives `tilt-card-1` */
export function TiltCardImageDemo({
  isReverse = true,
  rotationFactor = 8,
}: TiltCardImageDemoProps) {
  return (
    <TiltCard isReverse={isReverse} rotationFactor={rotationFactor}>
      <div className="flex max-w-[270px] flex-col overflow-hidden rounded-xl border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
        <Image
          alt="Shibuya crossing at night, Tokyo"
          className="h-48 w-full object-cover"
          height={192}
          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=540&h=384&fit=crop"
          width={270}
        />
        <div className="p-2">
          <h1 className="font-mono text-zinc-950 leading-snug dark:text-zinc-50">
            Tokyo
          </h1>
          <p className="text-zinc-700 dark:text-zinc-400">Shibuya at night</p>
        </div>
      </div>
    </TiltCard>
  );
}

export default TiltCardImageDemo;
